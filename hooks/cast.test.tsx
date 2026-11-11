import { expect, test } from 'claude-code/testing'

const PANE_ID = 'suits-cast'
const LOG_PATH = '/donna/action-log.md'

const PANE = {
  plugin: 'suits',
  component: 'Pane',
  requestId: PANE_ID,
  props: {
    title: 'Cast',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

const LOG = `| ID | Owner | Task | Due | Status |
| --- | --- | --- | --- | --- |
| A-014 | Maria Santos | Send the signed UAT results | 18 November 2026 | open |
| A-015 | Ben Cruz | Book the venue | | parked |
| A-016 | Ana Reyes | Pay the vendor | | done |
`

type Engine = { opened: string[]; file: { log: string | undefined }; reads: string[]; toasts: string[] }

// The engine beneath the plugin: the manifest, the action log (served from
// `file.log`, absent when undefined) and a bottom for every tool call.
function engine(on: any, log?: string, files: Record<string, string> = {}): Engine {
  const seen: Engine = { opened: [], file: { log }, reads: [], toasts: [] }

  on('fs.read', (_: unknown, e: { path: string }) => {
    if (e.path.endsWith('.claude-plugin/plugin.json')) {
      return { value: JSON.stringify({ skills: ['./skills/characters/harvey', './skills/characters/mike'] }) }
    }
    for (const [suffix, value] of Object.entries(files)) if (e.path.endsWith(suffix)) return { value }
    if (e.path === LOG_PATH && seen.file.log !== undefined) {
      seen.reads.push(e.path)
      return { value: seen.file.log }
    }
    throw new Error('ENOENT')
  })
  on('fs.exists', () => ({ value: false }))
  on('session.cwd', () => ({ value: '/' }))
  on('ui.toast', (_: unknown, e: { text: string }) => {
    seen.toasts.push(e.text)
    return { value: undefined }
  })
  on('env.get', () => ({ value: undefined }))
  on('command.register', () => ({ value: { command: 'x' } }))
  on('tool.register', (_: unknown, e: { name: string }) => ({ value: { name: e.name } }))
  on('ui.open', (_: unknown, e: { id: string }) => {
    seen.opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('skill.prompt', (_: unknown, e: { text: string }) => ({ text: e.text }))
  on('tool.call', () => ({ result: [{ type: 'text', text: 'ok' }] }))

  return seen
}

const prompt = (skill: string) => ({ skill, text: 'body', frontmatter: {}, source: 'plugin', pluginName: 'suits' }) as const

for (const surface of ['terminal', 'desktop'] as const) {
  const start = ($: any) => $.session.start({ cwd: '/', surface, isInteractive: true })
  const text = async (ui: any, pattern: RegExp) => (await ui.find({ type: 'Text', text: pattern }))?.text

  test(`${surface}: no pane opens until /suits-cast asks`, async ($, on) => {
    const seen = engine(on)
    await start($)
    await $.tool.call({ tool: 'Skill', skill: 'suits:harvey' })
    await $.tool.call({ tool: 'Bash', command: 'ls' })

    expect(seen.opened).toEqual([])

    const out = await $.command.run({ command: 'suits-cast' })

    expect(seen.opened).toEqual([PANE_ID])
    expect(out.text).toBe('Cast pane opened.')
  })

  test(`${surface}: the pane shows who holds the work, the hand-offs and each last tool`, async ($, on) => {
    engine(on)
    await start($)

    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await text(ui, /No character yet/)).toMatch(/No character yet/)
    expect(await text(ui, /No hand-offs yet/)).toMatch(/No hand-offs yet/)

    await $.tool.call({ tool: 'Skill', skill: 'suits:harvey' })
    await $.tool.call({ tool: 'Skill', skill: 'suits:mike' })

    expect(await text(ui, /Holding/)).toBe('Holding: mike')
    expect(await text(ui, /harvey → mike/)).toMatch(/harvey → mike/)

    await $.tool.call({ tool: 'Bash', command: 'ls' })
    expect(await text(ui, /mike:/)).toBe('mike: Bash')

    // the checklist tool answers for itself and is still seen
    await $.tool.call({ tool: 'mcp__suits__suits_checklist', steps: ['a', 'b'] })
    expect(await text(ui, /mike:/)).toBe('mike: mcp__suits__suits_checklist')
    await ui.unmount()
  })

  test(`${surface}: the skill prompt a Skill call raises makes no second hand-off`, async ($, on) => {
    engine(on)
    await start($)
    const ui = await $.ui.mount({ ...PANE, surface })

    await $.tool.call({ tool: 'Skill', skill: 'suits:harvey' })
    await $.tool.call({ tool: 'Skill', skill: 'suits:mike' })
    await $.skill.prompt(prompt('suits:mike'))

    expect(await text(ui, /Holding/)).toBe('Holding: mike')
    expect(await ui.find({ type: 'Text', text: /mike → mike/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /harvey → mike/ })).toBeDefined()
    await ui.unmount()
  })

  test(`${surface}: the skill prompt arriving before the Skill call makes no second hand-off either`, async ($, on) => {
    engine(on)
    await start($)
    const ui = await $.ui.mount({ ...PANE, surface })

    await $.tool.call({ tool: 'Skill', skill: 'suits:harvey' })
    await $.skill.prompt(prompt('suits:mike'))
    await $.tool.call({ tool: 'Skill', skill: 'suits:mike' })

    expect(await text(ui, /Holding/)).toBe('Holding: mike')
    expect(await text(ui, /→/)).toBe('Hand-offs: harvey → mike')
    await ui.unmount()
  })

  test(`${surface}: a skill prompt alone, as a slash command, takes the work`, async ($, on) => {
    engine(on)
    await start($)
    const ui = await $.ui.mount({ ...PANE, surface })

    await $.skill.prompt(prompt('suits:harvey'))

    expect(await text(ui, /Holding/)).toBe('Holding: harvey')
    await ui.unmount()
  })

  test(`${surface}: a call in a delegated loop is credited to the character that loop holds`, async ($, on) => {
    engine(on)
    await start($)
    const ui = await $.ui.mount({ ...PANE, surface })

    await $.tool.call({ tool: 'Skill', skill: 'suits:harvey' })
    await $.tool.call({ tool: 'Skill', skill: 'suits:mike', agentId: 'sub-1' })
    await $.tool.call({ tool: 'Edit', file_path: '/x', agentId: 'sub-1' })
    await $.tool.call({ tool: 'Read', file_path: '/y', agentId: 'sub-7' })

    expect(await text(ui, /mike:/)).toBe('mike: Edit')
    expect(await ui.find({ type: 'Text', text: /Read/ })).toBeUndefined()
    await ui.unmount()
  })

  test(`${surface}: the pane shows the action log, and an Edit of it redraws the pane`, async ($, on) => {
    const seen = engine(on, LOG)
    await start($)
    const ui = await $.ui.mount({ ...PANE, surface })

    expect(await text(ui, /open/)).toBe('1 open, 1 parked, 1 done')
    expect(await text(ui, /A-014/)).toBe('A-014 open Maria Santos: Send the signed UAT results (due 18 November 2026)')
    expect(await text(ui, /A-015/)).toBe('A-015 parked Ben Cruz: Book the venue')

    seen.file.log = LOG.replace('| open |', '| done |')
    await $.tool.call({ tool: 'Edit', file_path: LOG_PATH })

    expect(await text(ui, /parked/)).toBe('2 done, 1 parked')
    expect(await ui.find({ type: 'Text', text: /A-014/ })).toBeUndefined()
    await ui.unmount()
  })

  test(`${surface}: an Edit of another file does not read the log again`, async ($, on) => {
    const seen = engine(on, LOG)
    await start($)
    const before = seen.reads.length

    await $.tool.call({ tool: 'Edit', file_path: '/src/a.ts' })
    expect(seen.reads.length).toBe(before)

    await $.tool.call({ tool: 'Edit', file_path: LOG_PATH })
    expect(seen.reads.length).toBe(before + 1)
  })

  test(`${surface}: with no action log the pane says so`, async ($, on) => {
    engine(on)
    await start($)
    const ui = await $.ui.mount({ ...PANE, surface })

    expect(await text(ui, /action log/)).toBe('No action log.')
    await ui.unmount()
  })
}

test('a call the rules hook denies is still denied, and is not put on the board', async ($, on) => {
  engine(on, undefined, {
    '.claude/suits-rules.json': JSON.stringify({ never: [{ id: 'no-vault', why: 'owners only', match: 'vault/' }] }),
  })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: 'Skill', skill: 'suits:harvey' })

  const out = await $.tool.call({ tool: 'Edit', file_path: '/vault/x' })

  expect(out.deny).toMatch(/no-vault: owners only/)

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /Edit/ })).toBeUndefined()
  await ui.unmount()
})

// The board's write always loses to another (a conditional write that never
// lands), so feeding it rejects; the checklist's and the rest stay up. A hook
// that merely throws is skipped by the engine and breaks nothing.
const breakBoard = (on: any) => on('state.set', { plugin: 'suits', key: 'cast' }, () => ({ value: { isSet: false, version: 0 } }))

const WARN = { warn: [{ id: 'one-build', why: 'two builds at once exhaust the shared box', tools: ['Bash'], match: '\\bbuild\\b' }] }

test('a board failure leaves a call untouched: the rules still apply and nothing says the check failed', async ($, on) => {
  const seen = engine(on, undefined, { '.claude/suits-rules.json': JSON.stringify(WARN) })
  breakBoard(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const out = await $.tool.call({ tool: 'Bash', command: 'npm run build' })

  expect(out.deny).toBeUndefined()
  expect(JSON.stringify(out.result)).toContain('ok')
  expect(out.context).toEqual(['suits warning: one-build: two builds at once exhaust the shared box'])
  expect(seen.toasts).toEqual(['suits warning: one-build: two builds at once exhaust the shared box'])
  expect(seen.toasts.some(t => /rule check failed/.test(t))).toBe(false)
})

test('a board failure on a Skill call lets it through', async ($, on) => {
  engine(on)
  breakBoard(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const out = await $.tool.call({ tool: 'Skill', skill: 'suits:harvey' })

  expect(out.deny).toBeUndefined()
  expect(JSON.stringify(out.result)).toContain('ok')
})

test('a board failure on a suits_checklist call still answers with the checklist', async ($, on) => {
  const seen = engine(on)
  breakBoard(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const out = await $.tool.call({ tool: 'mcp__suits__suits_checklist', steps: ['a', 'b'] })

  expect(JSON.stringify(out.result)).toContain('1. [ ] a')
  expect(JSON.stringify(out.result)).toContain('0 of 2 done')
  expect(seen.toasts).toEqual([])
})
