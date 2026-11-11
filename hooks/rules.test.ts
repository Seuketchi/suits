import { expect, test } from 'claude-code/testing'

// A made-up project: the rules file stands at the git root, the session
// starts one folder below it.
const ROOT = '/work/project'
const CWD = `${ROOT}/app`
const FILE = JSON.stringify({
  never: [
    { id: 'no-vault', why: 'the vault is changed only by its owners', tools: ['Edit', 'Bash'], match: 'vault/' },
  ],
  warn: [
    { id: 'one-build', why: 'two builds at once exhaust the shared box', tools: ['Bash'], match: '\\bbuild\\b' },
  ],
})

// The engine beneath the plugin: a session in CWD, the given files, the
// toasts it was asked to show, and a tool that answers `ran`.
function engine(
  on: any,
  files: Record<string, string>,
  unreadable: string[] = [],
  beneath: { cwdFails?: true; denies?: string } = {},
) {
  const toasts: string[] = []

  on('session.cwd', () => {
    if (beneath.cwdFails) throw new Error('cwd lost')
    return { value: CWD }
  })
  on('fs.read', (_: unknown, e: { path: string }) => {
    if (e.path in files) return { value: files[e.path] }
    throw new Error(unreadable.includes(e.path) ? 'EACCES' : 'ENOENT')
  })
  on('fs.exists', (_: unknown, e: { path: string }) => ({
    value: e.path === `${ROOT}/.git` || unreadable.includes(e.path),
  }))
  on('ui.toast', (_: unknown, e: { text: string }) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('command.register', () => ({ value: { command: 'suits-rules' } }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('tool.call', () => (beneath.denies ? { deny: beneath.denies } : { result: {}, text: 'ran' }))

  return toasts
}

const withFile = { [`${ROOT}/.claude/suits-rules.json`]: FILE }

test('a never match is denied with its reason and a toast', async ($, on) => {
  const toasts = engine(on, withFile)

  const out = await $.tool.call({ tool: 'Edit', file_path: `${ROOT}/vault/a.txt`, old_string: 'a', new_string: 'b' })

  expect(out.deny).toBe('no-vault: the vault is changed only by its owners')
  expect(toasts).toEqual(['suits blocked Edit: no-vault: the vault is changed only by its owners'])
})

test('a warn match runs, toasts, and adds the why to the result', async ($, on) => {
  const toasts = engine(on, withFile)

  const out = await $.tool.call({ tool: 'Bash', command: 'make build' })

  expect(out.deny).toBeUndefined()
  expect(out.text).toBe('ran')
  expect(out.context).toEqual(['suits warning: one-build: two builds at once exhaust the shared box'])
  expect(toasts).toEqual(['suits warning: one-build: two builds at once exhaust the shared box'])
})

test('a call that matches nothing passes untouched', async ($, on) => {
  const toasts = engine(on, withFile)

  const out = await $.tool.call({ tool: 'Bash', command: 'ls' })

  expect(out.deny).toBeUndefined()
  expect(out.context).toBeUndefined()
  expect(toasts).toEqual([])
})

test('with no rules file every call passes', async ($, on) => {
  const toasts = engine(on, {})

  const out = await $.tool.call({ tool: 'Bash', command: 'rm -rf vault/' })

  expect(out.deny).toBeUndefined()
  expect(toasts).toEqual([])
})

test('a broken file is reported once, then ignored', async ($, on) => {
  const toasts = engine(on, { [`${ROOT}/.claude/suits-rules.json`]: '{ nope' })

  const first = await $.tool.call({ tool: 'Bash', command: 'rm -rf vault/' })
  const second = await $.tool.call({ tool: 'Bash', command: 'rm -rf vault/' })

  expect(first.deny).toBeUndefined()
  expect(second.deny).toBeUndefined()
  expect(toasts.length).toBe(1)
  expect(toasts[0]).toMatch(/could not be read/)
})

test('the rules command shows the file, or says there is none', async ($, on) => {
  engine(on, withFile)
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })

  const shown = await $.command.run({ command: 'suits-rules' })

  expect(shown.text).toContain(`${ROOT}/.claude/suits-rules.json`)
  expect(shown.text).toContain('never\tno-vault\tthe vault is changed only by its owners\tEdit,Bash\tvault/')
  expect(shown.text).toContain('warn\tone-build')
})

test('the rules command with no file says so', async ($, on) => {
  engine(on, {})
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })

  const shown = await $.command.run({ command: 'suits-rules' })

  expect(shown.text).toBe('No suits rules file here (.claude/suits-rules.json). The rule hooks are off.')
})

test('an unreadable file is reported once and shown, not taken for no file', async ($, on) => {
  const path = `${ROOT}/.claude/suits-rules.json`
  const toasts = engine(on, {}, [path])
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })

  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  const shown = await $.command.run({ command: 'suits-rules' })

  expect(toasts.length).toBe(1)
  expect(toasts[0]).toMatch(/could not be read/)
  expect(toasts[0]).toContain(path)
  expect(shown.text).toContain(path)
  expect(shown.text).toMatch(/could not be read/)
})

test('the search stops at the git root', async ($, on) => {
  const toasts = engine(on, { '/work/.claude/suits-rules.json': FILE })

  const out = await $.tool.call({ tool: 'Edit', file_path: `${ROOT}/vault/a.txt`, old_string: 'a', new_string: 'b' })

  expect(out.deny).toBeUndefined()
  expect(toasts).toEqual([])
})

test('a bad rule is reported once and only that rule is dropped', async ($, on) => {
  const file = JSON.stringify({
    never: [{ id: 'bad', why: 'w' }, { id: 'no-vault', why: 'owners only', match: 'vault/' }],
  })
  const toasts = engine(on, { [`${ROOT}/.claude/suits-rules.json`]: file })

  const first = await $.tool.call({ tool: 'Edit', file_path: `${ROOT}/vault/a`, old_string: 'a', new_string: 'b' })
  await $.tool.call({ tool: 'Bash', command: 'ls' })

  expect(first.deny).toBe('no-vault: owners only')
  expect(toasts.filter(t => /never\[0\]/.test(t)).length).toBe(1)
})

test('a warn is not toasted when a hook beneath denies the call', async ($, on) => {
  const toasts = engine(on, withFile, [], { denies: 'refused beneath' })

  const out = await $.tool.call({ tool: 'Bash', command: 'make build' })

  expect(out.deny).toBe('refused beneath')
  expect(toasts).toEqual([])
})

test('a failed check passes the call and says it was not checked', async ($, on) => {
  const toasts = engine(on, withFile, [], { cwdFails: true })

  const out = await $.tool.call({ tool: 'Bash', command: 'rm -rf vault/' })
  await $.tool.call({ tool: 'Bash', command: 'rm -rf vault/' })

  expect(out.deny).toBeUndefined()
  expect(toasts.length).toBe(1)
  expect(toasts[0]).toMatch(/^suits: rule check failed \(.+\); this call was not checked$/)
})
