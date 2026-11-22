export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

export type Snapshot = {
  limits: Limit[]
  contextTokens?: number
  contextWindow?: number
  contextPercent?: number
}

declare module 'claude-code' {
  interface PluginState {
    'usage-rail': {
      snap: Shaped<Snapshot>
      now: number
      busy: boolean
      turnStartPct: number
      lastDelta: number
      turnStartWeek: number
      lastDeltaWeek: number
    }
  }
}
