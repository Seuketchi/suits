// The values the mod keeps for the session. `done` holds step numbers counted
// from 1, as the pane shows them.
export type Checklist = { steps: string[]; done: number[] }

// The cast board: who holds the work, how it passed on, and each character's
// last tool. `loops` maps a loop id ('' is the main loop) to its character.
export type CastBoard = {
  holder: string
  loops: Record<string, string>
  handoffs: { from: string; to: string }[]
  lastTool: Record<string, string>
}

// donna's action log as the pane shows it; read, never written.
export type ActionLog =
  | { status: 'missing' }
  | { status: 'ok'; rows: { id: string; owner: string; task: string; due: string; status: string }[] }

declare module 'claude-code' {
  interface PluginState {
    suits: {
      // The job's steps and which are done (`suits_checklist` writes it).
      checklist: Shaped<Checklist>
      // The character working, from the last `suits:<character>` skill; '' for none.
      character: Shaped<string>
      // Who holds the work, the hand-offs and each character's last tool.
      cast: Shaped<CastBoard>
      // donna/action-log.md as last read; 'missing' when there is none.
      actionLog: Shaped<ActionLog>
    }
  }
}
