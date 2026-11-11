// The values the mod keeps for the session. `done` holds step numbers counted
// from 1, as the pane shows them.
export type Checklist = { steps: string[]; done: number[] }

declare module 'claude-code' {
  interface PluginState {
    suits: {
      // The job's steps and which are done (`suits_checklist` writes it).
      checklist: Shaped<Checklist>
      // The character working, from the last `suits:<character>` skill; '' for none.
      character: Shaped<string>
    }
  }
}
