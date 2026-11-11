import { expect, test } from 'claude-code/testing'

const PANE_ID = 'suits-checklist'
const TOOL = 'mcp__suits__suits_checklist'

const PANE = {
  plugin: 'suits',
  component: 'Pane',
  requestId: PANE_ID,
  props: {
    title: 'Checklist',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

// The engine beneath the plugin: the plugin's own manifest, and a record of
// every pane and tool it was asked to register or open.
function engine(on: any) {
  const opened: string[] = []
  const tools: string[] = []

  on('fs.read', (_: unknown, e: { path: string }) => {
    if (e.path.endsWith('.claude-plugin/plugin.json')) {
      return { value: JSON.stringify({ skills: ['./skills/characters/louis'] }) }
    }
    throw new Error('ENOENT')
  })
  on('env.get', () => ({ value: undefined }))
  on('command.register', () => ({ value: { command: 'x' } }))
  on('tool.register', (_: unknown, e: { name: string }) => {
    tools.push(e.name)
    return { value: { name: e.name } }
  })
  on('ui.open', (_: unknown, e: { id: string }) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('skill.prompt', (_: unknown, e: { text: string }) => ({ text: e.text }))

  return { opened, tools }
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: no pane is open until /suits-checklist asks`, async ($, on) => {
    const { opened, tools } = engine(on)

    await $.session.start({ cwd: '/', surface, isInteractive: true })
    await $.tool.call({ tool: TOOL, steps: ['write the test', 'make it pass'] })

    expect(tools).toEqual(['suits_checklist'])
    expect(opened).toEqual([])

    const out = await $.command.run({ command: 'suits-checklist' })

    expect(opened).toEqual([PANE_ID])
    expect(out.text).toMatch(/Checklist pane opened/)
  })

  test(`${surface}: a suits_checklist call redraws the pane with the steps and the count`, async ($, on) => {
    engine(on)
    await $.session.start({ cwd: '/', surface, isInteractive: true })

    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /No steps yet/ }))?.text).toMatch(/No steps yet/)

    await $.tool.call({ tool: TOOL, steps: ['write the test', 'make it pass', 'commit'] })

    expect((await ui.find({ type: 'Text', text: /write the test/ }))?.text).toMatch(/left/)
    expect((await ui.find({ type: 'Text', text: /0 of 3 done/ }))?.text).toBe('0 of 3 done')

    await $.tool.call({ tool: TOOL, done: [1, 2] })

    expect((await ui.find({ type: 'Text', text: /write the test/ }))?.text).toMatch(/done/)
    expect((await ui.find({ type: 'Text', text: /2 of 3 done/ }))?.text).toBe('2 of 3 done')
    await ui.unmount()
  })

  test(`${surface}: the pane shows the working character`, async ($, on) => {
    engine(on)
    await $.session.start({ cwd: '/', surface, isInteractive: true })

    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /No character yet/ }))?.text).toMatch(/No character yet/)

    await $.skill.prompt({ skill: 'suits:louis', text: 'body', frontmatter: {}, source: 'plugin', pluginName: 'suits' })

    expect((await ui.find({ type: 'Text', text: /louis/ }))?.text).toMatch(/louis/)
    await ui.unmount()
  })
}

test('the tool answers with the list, the count and what it ignored', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const out = await $.tool.call({ tool: TOOL, steps: ['a', 'b'], done: [1, 7] })

  expect(JSON.stringify(out.result)).toContain('1. [x] a')
  expect(JSON.stringify(out.result)).toContain('1 of 2 done')
  expect(JSON.stringify(out.result)).toContain('ignored 7')
})
