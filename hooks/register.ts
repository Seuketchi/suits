import type { Register } from 'claude-code'

import {
  RULES_PATH,
  decide,
  parseRules,
  rulesReport,
  searchDirs,
  toastFor,
  unreadableRules,
  warnNotes,
} from './logic.mjs'

// Looks for the rules file in the start directory and each parent up to the
// git root. All the deciding is in logic.mjs; this only reads and shows.
async function findRules($: any): Promise<{ path?: string; parsed: ReturnType<typeof parseRules> }> {
  const cwd: string = await $.session.cwd()

  for (const dir of searchDirs(cwd)) {
    const base = dir === '/' ? '' : dir
    const path = `${base}/${RULES_PATH}`
    let text: string | undefined
    let failure: unknown

    try {
      text = await $.fs.read(path)
    } catch (error) {
      failure = error
    }

    if (text !== undefined) return { path, parsed: parseRules(text) }

    // A read that failed on a file that is there is not "no file": it would
    // turn every never rule off without a word.
    if (failure !== undefined && (await $.fs.exists(path).catch(() => true))) {
      return { path, parsed: unreadableRules(failure instanceof Error ? failure.message : String(failure)) }
    }

    if (await $.fs.exists(`${base}/.git`)) break
  }

  return { parsed: { status: 'missing' } }
}

export const register: Register = on => {
  // A broken file, or a bad rule in one, is reported once, then ignored.
  const reported = new Set<string>()
  // A check that failed is told once per cause.
  const failed = new Set<string>()

  on('tool.call', async ($, e, next) => {
    const { path, parsed } = await findRules($)

    if (path && parsed.status === 'broken') {
      const key = `${path}\n${parsed.reason}`

      if (!reported.has(key)) {
        reported.add(key)
        $.ui.toast(`suits: ${path} could not be read (${parsed.reason}); its rules are ignored.`)
      }
    } else if (path && parsed.status === 'ok' && parsed.problems.length > 0) {
      const key = `${path}\n${parsed.problems.join('\n')}`

      if (!reported.has(key)) {
        reported.add(key)
        $.ui.toast(`suits: ${path}: ${parsed.problems.join('; ')}. Those rules are ignored; the others apply.`)
      }
    }

    const decision = decide(parsed.status === 'ok' ? parsed.rules : undefined, e)

    if (decision.action === 'block') {
      $.ui.toast(toastFor(decision, e.tool) as string)

      return { deny: decision.message }
    }

    const ran = await next(e)

    // A warning is for a call that ran: not one a hook beneath refused.
    if (ran.deny !== undefined || decision.action !== 'warn') return ran

    $.ui.toast(toastFor(decision, e.tool) as string)

    return { ...ran, context: [...(ran.context ?? []), ...warnNotes(decision)] }
  }).catch(($, e, next) => {
    const why = next.error.message ?? next.error.kind

    // Fail open, but say so: this call was not checked.
    if (!failed.has(why)) {
      failed.add(why)
      try {
        $.ui.toast(`suits: rule check failed (${why}); this call was not checked`)
      } catch {
        // nothing more can be said
      }
    }

    return next(e)
  })

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
