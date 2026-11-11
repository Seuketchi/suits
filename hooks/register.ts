import type { Register } from 'claude-code'

import {
  RULES_PATH,
  decide,
  parseRules,
  rulesReport,
  searchDirs,
  toastFor,
  warnNotes,
} from './logic.mjs'

// Looks for the rules file in the start directory and each parent up to the
// git root. All the deciding is in logic.mjs; this only reads and shows.
async function findRules($: any): Promise<{ path?: string; parsed: ReturnType<typeof parseRules> }> {
  const cwd: string = await $.session.cwd()

  for (const dir of searchDirs(cwd)) {
    const base = dir === '/' ? '' : dir
    const path = `${base}/${RULES_PATH}`
    const text: string | undefined = await $.fs.read(path).catch(() => undefined)

    if (text !== undefined) return { path, parsed: parseRules(text) }
    if (await $.fs.exists(`${base}/.git`)) break
  }

  return { parsed: { status: 'missing' } }
}

export const register: Register = on => {
  // A broken file is reported once, then ignored.
  const reported = new Set<string>()

  on('tool.call', async ($, e, next) => {
    const { path, parsed } = await findRules($)

    if (parsed.status === 'broken' && path && !reported.has(path)) {
      reported.add(path)
      $.ui.toast(`suits: ${path} could not be read (${parsed.reason}); its rules are ignored.`)
    }

    const decision = decide(parsed.status === 'ok' ? parsed.rules : undefined, e)
    const toast = toastFor(decision, e.tool)

    if (toast) $.ui.toast(toast)
    if (decision.action === 'block') return { deny: decision.message }

    const ran = await next(e)
    const notes = warnNotes(decision)

    if (ran.deny !== undefined || notes.length === 0) return ran

    return { ...ran, context: [...(ran.context ?? []), ...notes] }
  }).catch(($, e, next) => next(e))

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'suits-rules',
      description: "Show this project's suits rules file.",
    })

    return next(e)
  })

  on('command.run', { command: 'suits-rules' }, async $ => {
    const { path, parsed } = await findRules($)

    return { text: rulesReport(path, parsed) }
  })
}
