import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Checklist } from '../types'

import {
  HELPER_DENY,
  HELPER_PROMPT,
  HELPER_TOAST,
  RULES_PATH,
  applyChecklist,
  characterOf,
  charactersFrom,
  checklistCount,
  checklistRows,
  checklistText,
  decide,
  paneText,
  helperOn,
  parseRules,
  rulesReport,
  searchDirs,
  statusFor,
  toastFor,
  unreadableRules,
  warnNotes,
} from './logic.mjs'
import { checkReadOnly, denyMessage, readOnlyCharacter } from './readonly.mjs'

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

// What the pane draws from. The checklist is the job's steps and which are
// done; the character is the one the last `suits:<character>` skill named.
// Change a tag when a value's fields change: it declines what an earlier
// version stored, which outlives a reload.
const checklist = atom({ plugin: 'suits', key: 'checklist' } as const, { steps: [], done: [] } as Checklist, {
  shape: 'checklist-1',
})
const character = atom({ plugin: 'suits', key: 'character' } as const, '', { shape: 'character-1' })

const PANE_ID = 'suits-checklist'
const CHECKLIST_TOOL = 'suits_checklist'

// The one switch, read at each event so a value set by another plugin's
// session.start is seen whatever the load order. This is the only variable
// the mod reads.
const isHelper = async ($: any): Promise<boolean> => helperOn(await $.env.get('SUITS_HELPER'))

// The characters, read once from the plugin's own manifest.
let characters: string[] | undefined

async function charactersOf($: any): Promise<string[]> {
  if (characters === undefined) {
    try {
      characters = charactersFrom(await $.fs.read(`${$.plugin.root}/.claude-plugin/plugin.json`))
    } catch {
      return []
    }
  }

  return characters
}

// The type of the subagent a call runs in, from the session's agent list.
async function agentType($: any, agentId: string): Promise<string | undefined> {
  return (await $.agent.list()).find((a: { id: string }) => a.id === agentId)?.type
}

// Why a Bash call from a subagent is refused, or nothing when it may run. A
// call is refused when its subagent is one of the three and the command is not
// a read, and also when the session's list cannot be read: the guard fails
// closed there. A subagent the list does not name has no type to hold, so it
// runs (ADR 0009).
async function readOnlyDenial(
  $: any,
  e: { agentId?: string; command: string },
): Promise<{ who: string; message: string } | undefined> {
  if (e.agentId === undefined) return undefined

  try {
    const who = readOnlyCharacter(await agentType($, e.agentId), $.plugin.name)

    if (who === undefined) return undefined

    const verdict = checkReadOnly(e.command)

    return verdict.allowed ? undefined : { who, message: denyMessage(who, verdict.why as string) }
  } catch {
    return { who: 'a read-only version', message: denyMessage('this version', 'The check could not run, so the command was not allowed') }
  }
}

export const register: Register = on => {
  // A broken file, or a bad rule in one, is reported once, then ignored.
  const reported = new Set<string>()
  // A check that failed is told once per cause.
  const failed = new Set<string>()

  on('tool.call', { tool: `mcp__suits__${CHECKLIST_TOOL}` }, async ($, e) => {
    const { checklist: next, notes } = applyChecklist(await read($, checklist), e)

    await update($, checklist, () => next)

    return { result: [{ type: 'text', text: checklistText(next, notes) }] }
  })

  // The read-only versions of louis, mike and rachel run `Bash` to read only
  // (ADR 0009). The main session and every other subagent are not held here.
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const denial = await readOnlyDenial($, e)

    if (denial === undefined) return next(e)

    try {
      $.ui.toast(`suits blocked Bash: ${denial.who} is read-only (ADR 0009)`)
    } catch {
      // the owner is not told; the call is still refused
    }

    return { deny: denial.message }
  })

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

  // A helper starts no session of its own.
  on('agent.spawn', async ($, e, next) => {
    if (!(await isHelper($))) return next(e)

    $.ui.toast(HELPER_TOAST)

    return { deny: HELPER_DENY }
  }).catch(async ($, e, next) => {
    // If the hook broke, ask again, and let the spawn through
    // only when the switch is off or cannot be read at all.
    let helper = false

    try {
      helper = await isHelper($)
    } catch {
      // unreadable: treated as off
    }

    return helper ? { deny: HELPER_DENY } : next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)

    if (!(await isHelper($))) return composed

    return {
      sections: [...composed.sections, { id: 'suits:helper', text: HELPER_PROMPT, scope: 'session' as const }],
    }
  })

  // The status line names the working character; a tool skill leaves it be.
  on('skill.prompt', async ($, e, next) => {
    const name = characterOf(e.skill, await charactersOf($), e.pluginName)

    if (name) {
      $.ui.status(statusFor(name, await isHelper($)))
      await update($, character, () => name)
    }

    return next(e)
  })

  on('session.start', async ($, e, next) => {
    if (await isHelper($)) $.ui.status(statusFor(undefined, true))

    await $.command.register({
      name: 'suits-rules',
      description: "Show this project's suits rules file.",
    })
    await $.command.register({
      name: 'suits-checklist',
      description: "Open the checklist pane for the job's steps.",
    })
    await $.tool.register({
      name: CHECKLIST_TOOL,
      description:
        'Keeps the checklist of a job of three or more steps, shown in a pane the owner can open. Call it with `steps` (a list of short strings) to set the list, which clears what was done, and with `done` (step numbers counted from 1) to mark steps done; numbers add to those already done. Both may be sent in one call.',
      inputSchema: {
        type: 'object',
        properties: {
          steps: { type: 'array', items: { type: 'string' }, description: 'The steps, in order. Replaces the list.' },
          done: { type: 'array', items: { type: 'integer' }, description: 'Step numbers, from 1, to mark done.' },
        },
      },
      isDeferred: false,
    })

    return next(e)
  })

  on('command.run', { command: 'suits-rules' }, async $ => {
    const { path, parsed } = await findRules($)

    return { text: rulesReport(path, parsed) }
  })

  // The pane opens only when the owner asks for it.
  on('command.run', { command: 'suits-checklist' }, async $ => {
    const opened = await $.ui.open({ id: PANE_ID, title: 'Checklist' })

    return { text: paneText(opened) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, checklist)
    const who = await read($, character)

    return (
      <Box flexDirection="column">
        <Text>{who ? who : 'No character yet.'}</Text>
        {list.steps.length === 0 && <Text dimColor>No steps yet.</Text>}
        {checklistRows(list).map(row => (
          <Text dimColor={row.isDone}>
            {row.number}. {row.isDone ? 'done' : 'left'} {row.text}
          </Text>
        ))}
        <Text>{checklistCount(list)}</Text>
      </Box>
    )
  })
}
