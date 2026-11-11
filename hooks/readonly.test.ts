import { expect, test } from 'claude-code/testing'

const AGENTS = [
  { id: 'l1', type: 'suits:louis', status: 'running', description: 'review' },
  { id: 'r1', type: 'suits:rachel', status: 'running', description: 'dig' },
  { id: 'h1', type: 'suits:harvey', status: 'running', description: 'decide' },
  { id: 'g1', type: 'general-purpose', status: 'running', description: 'other' },
]

// The engine beneath the plugin: the session's agents, the toasts it was asked
// to show, and a Bash that runs whatever it is given.
function engine(on: any, beneath: { listFails?: true; agents?: typeof AGENTS } = {}) {
  const toasts: string[] = []
  const ran: string[] = []

  on('agent.list', () => {
    if (beneath.listFails) throw new Error('list lost')
    return { value: beneath.agents ?? AGENTS }
  })
  on('ui.toast', (_: unknown, e: { text: string }) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  on('session.cwd', () => ({ value: '/work/project' }))
  on('fs.read', () => {
    throw new Error('ENOENT')
  })
  on('fs.exists', () => ({ value: false }))
  on('tool.call', (_: unknown, e: { command: string }) => {
    ran.push(e.command)
    return { result: {}, text: 'ran' }
  })

  return { toasts, ran }
}

test('louis is denied a write, with the ADR and a toast, and nothing runs', async ($, on) => {
  const { toasts, ran } = engine(on)

  const out = await $.tool.call({ tool: 'Bash', command: 'echo hi > out.txt', agentId: 'l1' })

  expect(out.deny).toContain('louis is read-only (ADR 0009)')
  expect(out.deny).toContain('redirection')
  expect(toasts).toEqual(['suits blocked Bash: louis is read-only (ADR 0009)'])
  expect(ran).toEqual([])
})

test('rachel is denied git push', async ($, on) => {
  const { ran } = engine(on)
  const out = await $.tool.call({ tool: 'Bash', command: 'git push origin main', agentId: 'r1' })
  expect(out.deny).toContain('rachel is read-only')
  expect(ran).toEqual([])
})

test('a read command from louis runs', async ($, on) => {
  const { toasts, ran } = engine(on)
  const out = await $.tool.call({ tool: 'Bash', command: 'git log --oneline -5', agentId: 'l1' })
  expect(out.deny).toBeUndefined()
  expect(ran).toEqual(['git log --oneline -5'])
  expect(toasts).toEqual([])
})

test('a subagent that is not one of the three is not held', async ($, on) => {
  const { ran } = engine(on)
  for (const agentId of ['h1', 'g1']) {
    const out = await $.tool.call({ tool: 'Bash', command: 'rm -rf build', agentId })
    expect(out.deny).toBeUndefined()
  }
  expect(ran.length).toBe(2)
})

// Pinned on purpose (ADR 0009): a loop the session's list does not name (a workflow's, an
// engine fork) is not one of the three, and holding it would break other work.
test('a subagent the session does not list is not held', async ($, on) => {
  const { ran, toasts } = engine(on)

  const out = await $.tool.call({ tool: 'Bash', command: 'git commit -m x', agentId: 'unknown' })

  expect(out.deny).toBeUndefined()
  expect(ran).toEqual(['git commit -m x'])
  expect(toasts).toEqual([])
})

test('the main session is not held', async ($, on) => {
  const { ran } = engine(on)
  const out = await $.tool.call({ tool: 'Bash', command: 'git commit -m x' })
  expect(out.deny).toBeUndefined()
  expect(ran).toEqual(['git commit -m x'])
})

test('other tools are not looked at', async ($, on) => {
  engine(on)
  const out = await $.tool.call({ tool: 'Read', file_path: '/work/project/a.txt', agentId: 'l1' })
  expect(out.deny).toBeUndefined()
})

test('a subagent call that cannot be checked is denied, not let through', async ($, on) => {
  const { ran } = engine(on, { listFails: true })

  const out = await $.tool.call({ tool: 'Bash', command: 'git log', agentId: 'l1' })

  expect(out.deny).toContain('ADR 0009')
  expect(ran).toEqual([])
})

test('a main session call still runs when the agent list is lost', async ($, on) => {
  const { ran } = engine(on, { listFails: true })
  const out = await $.tool.call({ tool: 'Bash', command: 'git commit -m x' })
  expect(out.deny).toBeUndefined()
  expect(ran).toEqual(['git commit -m x'])
})
