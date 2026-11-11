import { expect, test } from 'claude-code/testing'

const CHARACTERS = JSON.stringify({
  skills: ['./skills/characters/louis', './skills/characters/donna', './skills/tools/tdd'],
})

// The engine beneath the plugin: the plugin's own manifest, the status lines
// and toasts it was asked to show, and a spawn that would start.
function engine(on: any, env: Record<string, string>) {
  const toasts: string[] = []
  const statuses: Array<string | undefined> = []

  on('env.get', (_: unknown, e: { name: string }) => ({ value: env[e.name] }))
  on('fs.read', (_: unknown, e: { path: string }) => {
    if (e.path.endsWith('.claude-plugin/plugin.json')) return { value: CHARACTERS }
    throw new Error('ENOENT')
  })
  on('ui.toast', (_: unknown, e: { text: string }) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.status', (_: unknown, e: { text: string | undefined }) => {
    statuses.push(e.text)
    return { value: undefined }
  })
  on('agent.spawn', () => ({ model: 'm', agentId: 'a1' }))
  on('skill.prompt', (_: unknown, e: { text: string }) => ({ text: e.text }))
  on('prompt.compose', () => ({ sections: [] }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('command.register', () => ({ value: { command: 'x' } }))

  return { toasts, statuses }
}

const COMPOSE = { model: 'm', promptModel: 'm', surfaces: [], tools: [], outputStyle: null, traits: [] } as const
const SPAWN = { prompt: 'review this in parallel', description: 'review', subagentType: 'general-purpose' }
const PLUGIN_PATH = (skill: string) => ({ skill, text: 'body', frontmatter: {}, source: 'plugin' as const })

test('with SUITS_HELPER=1 a new session is denied with the reason and a toast', async ($, on) => {
  const { toasts } = engine(on, { SUITS_HELPER: '1' })

  const out = await $.agent.spawn(SPAWN)

  expect(out.deny).toBe('This session is a helper: do the work yourself in one pass (Working alone).')
  expect(toasts).toEqual(['suits blocked a new session: helper mode'])
})

test('with SUITS_HELPER unset or 0 a spawn passes', async ($, on) => {
  const { toasts } = engine(on, {})
  expect((await $.agent.spawn(SPAWN)).deny).toBeUndefined()
  expect(toasts).toEqual([])
})

test('SUITS_HELPER=0 is off', async ($, on) => {
  engine(on, { SUITS_HELPER: '0' })
  expect((await $.agent.spawn(SPAWN)).deny).toBeUndefined()
})

test('the switch is read at each event, not once', async ($, on) => {
  const env: Record<string, string> = {}
  const { toasts } = engine(on, env)

  expect((await $.agent.spawn(SPAWN)).deny).toBeUndefined()
  env.SUITS_HELPER = '1'
  expect((await $.agent.spawn(SPAWN)).deny).toBeDefined()
  delete env.SUITS_HELPER
  expect((await $.agent.spawn(SPAWN)).deny).toBeUndefined()
  expect(toasts.length).toBe(1)
})

test('in helper mode the prompt gains the helper line, last', async ($, on) => {
  engine(on, { SUITS_HELPER: '1' })

  const out = await $.prompt.compose(COMPOSE)

  expect(out.sections.at(-1)?.text).toBe(
    'Helper mode is on: follow the Working alone section of the character you are running.',
  )
  expect(out.sections.at(-1)?.scope).toBe('session')
})

test('out of helper mode the prompt is left alone', async ($, on) => {
  engine(on, {})

  expect((await $.prompt.compose(COMPOSE)).sections).toEqual([])
})

test('after a skill.prompt for suits:louis the status line reads louis · helper', async ($, on) => {
  const { statuses } = engine(on, { SUITS_HELPER: '1' })

  await $.skill.prompt(PLUGIN_PATH('suits:louis'))

  expect(statuses.at(-1)).toBe('louis · helper')
})

test('with the switch unset the status line reads louis', async ($, on) => {
  const { statuses } = engine(on, {})

  await $.skill.prompt(PLUGIN_PATH('suits:louis'))

  expect(statuses.at(-1)).toBe('louis')
})

test('a tool skill does not change the status line', async ($, on) => {
  const { statuses } = engine(on, {})

  await $.skill.prompt(PLUGIN_PATH('suits:tdd'))
  await $.skill.prompt(PLUGIN_PATH('commit'))

  expect(statuses).toEqual([])
})

test('in helper mode with no character yet the status line reads helper', async ($, on) => {
  const { statuses } = engine(on, { SUITS_HELPER: '1' })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  expect(statuses.at(-1)).toBe('helper')
})
