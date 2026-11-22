import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionUsage } from 'claude-code'

import type { Limit, Snapshot } from '../types'

const PANE = 'usage-rail'

// ---------- language ----------

type Strings = {
  title: string
  context: string
  fiveHour: string
  weekly: string
  of: string
  reset: string
  noData: string
  days: string[]
  cmd: string
  opened: string
  notOpened: string
  compact: string
  failed: string
}

const STRINGS: Record<string, Strings> = {
  en: {
    title: 'Usage', context: 'Context', fiveHour: '5 hours', weekly: 'Weekly', of: 'of', reset: 'reset',
    noData: 'no data', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    cmd: 'Open the usage widget: context, 5-hour and weekly limits',
    opened: 'Usage widget opened.', notOpened: 'Could not open it:',
    compact: 'Compact', failed: 'Could not compact:',
  },
  es: {
    title: 'Uso', context: 'Contexto', fiveHour: '5 horas', weekly: 'Semanal', of: 'de', reset: 'reiniciado',
    noData: 'sin datos', days: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    cmd: 'Abre el widget de uso: contexto, límite de 5 h y semanal',
    opened: 'Widget de uso abierto.', notOpened: 'No se pudo abrir:',
    compact: 'Compactar', failed: 'No se pudo compactar:',
  },
  pt: {
    title: 'Uso', context: 'Contexto', fiveHour: '5 horas', weekly: 'Semanal', of: 'de', reset: 'reiniciado',
    noData: 'sem dados', days: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
    cmd: 'Abre o widget de uso: contexto, limite de 5 h e semanal',
    opened: 'Widget de uso aberto.', notOpened: 'Não foi possível abrir:',
    compact: 'Compactar', failed: 'Não foi possível compactar:',
  },
  fr: {
    title: 'Utilisation', context: 'Contexte', fiveHour: '5 heures', weekly: 'Semaine', of: 'sur', reset: 'réinitialisé',
    noData: 'aucune donnée', days: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
    cmd: "Ouvre le widget d'utilisation : contexte, limites 5 h et hebdomadaire",
    opened: "Widget d'utilisation ouvert.", notOpened: "Impossible de l'ouvrir :",
    compact: 'Compacter', failed: 'Compactage impossible :',
  },
  de: {
    title: 'Nutzung', context: 'Kontext', fiveHour: '5 Stunden', weekly: 'Woche', of: 'von', reset: 'zurückgesetzt',
    noData: 'keine Daten', days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    cmd: 'Öffnet das Nutzungs-Widget: Kontext, 5-Stunden- und Wochenlimit',
    opened: 'Nutzungs-Widget geöffnet.', notOpened: 'Konnte nicht geöffnet werden:',
    compact: 'Kompaktieren', failed: 'Kompaktieren fehlgeschlagen:',
  },
  it: {
    title: 'Utilizzo', context: 'Contesto', fiveHour: '5 ore', weekly: 'Settimana', of: 'di', reset: 'azzerato',
    noData: 'nessun dato', days: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
    cmd: 'Apre il widget di utilizzo: contesto, limiti di 5 ore e settimanale',
    opened: 'Widget di utilizzo aperto.', notOpened: 'Impossibile aprirlo:',
    compact: 'Compatta', failed: 'Impossibile compattare:',
  },
}

// Maps "es-CL", "spanish", "Español", "pt_BR.UTF-8"... to a key of STRINGS, or undefined.
const langOf = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined
  const s = raw.trim().toLowerCase()
  const prefixes: [string, string[]][] = [
    ['es', ['es', 'span', 'espa', 'castell']],
    ['pt', ['pt', 'portu']],
    ['fr', ['fr']],
    ['de', ['de', 'germ', 'deut']],
    ['it', ['it']],
    ['en', ['en']],
  ]
  for (const [key, ps] of prefixes) if (ps.some(p => s.startsWith(p))) return key
  return undefined
}

// Claude Code's own `language` setting first, then the system locale, then LANG; English otherwise.
let L: Strings = STRINGS.en as Strings
const detectLanguage = async ($: EngineInterface) => {
  let key: string | undefined
  try {
    const setting: unknown = await $.settings.read({ key: 'language' })
    key = langOf(typeof setting === 'string' ? setting : undefined)
  } catch {}
  if (!key) {
    try {
      key = langOf(Intl.DateTimeFormat().resolvedOptions().locale)
    } catch {}
  }
  if (!key) {
    try {
      key = langOf(await $.env.get('LANG'))
    } catch {}
  }
  L = STRINGS[key ?? 'en'] ?? (STRINGS.en as Strings)
  T = TIPS[key ?? 'en'] ?? (TIPS.en as Tips)
}

// The hover text on the context ring: when compacting is worth it.
type Tips = { ready: string; early: string }
const TIPS: Record<string, Tips> = {
  en: {
    ready: 'Good time to compact: the conversation is long. Best between tasks; Compact summarizes it and frees context.',
    early: 'Compact unlocks from 200k tokens (or 50% of the window). Earlier, the summary loses detail and saves little.',
  },
  es: {
    ready: 'Buen momento para compactar: la conversación ya es larga. Mejor entre tareas; Compactar la resume y libera contexto.',
    early: 'Compactar se activa desde 200k tokens (o el 50% del contexto). Antes, el resumen pierde detalle y ahorra poco.',
  },
  pt: {
    ready: 'Bom momento para compactar: a conversa já é longa. Melhor entre tarefas; Compactar resume e libera contexto.',
    early: 'Compactar é ativado a partir de 200k tokens (ou 50% do contexto). Antes, o resumo perde detalhes e economiza pouco.',
  },
  fr: {
    ready: 'Bon moment pour compacter : la conversation est longue. Idéal entre deux tâches ; Compacter la résume et libère du contexte.',
    early: "Compacter s'active dès 200k tokens (ou 50 % du contexte). Avant, le résumé perd des détails et économise peu.",
  },
  de: {
    ready: 'Guter Zeitpunkt zum Kompaktieren: Das Gespräch ist lang. Am besten zwischen Aufgaben; es wird zusammengefasst und Kontext frei.',
    early: 'Kompaktieren ist ab 200k Tokens (oder 50 % des Kontexts) aktiv. Davor verliert die Zusammenfassung Details und spart wenig.',
  },
  it: {
    ready: 'Buon momento per compattare: la conversazione è lunga. Meglio tra un compito e l’altro; Compatta la riassume e libera contesto.',
    early: 'Compatta si attiva da 200k token (o dal 50% del contesto). Prima, il riassunto perde dettagli e risparmia poco.',
  },
}
let T: Tips = TIPS.en as Tips

// ---------- state ----------

const snap = atom({ plugin: 'usage-rail', key: 'snap' } as const, { limits: [] } as Snapshot, {
  shape: 'snap-1',
})
const now = atom({ plugin: 'usage-rail', key: 'now' } as const, 0)
const busy = atom({ plugin: 'usage-rail', key: 'busy' } as const, false)
// The 5-hour figure when the current turn began (-1: none), and what the last turn added.
const turnStartPct = atom({ plugin: 'usage-rail', key: 'turnStartPct' } as const, -1)
const lastDelta = atom({ plugin: 'usage-rail', key: 'lastDelta' } as const, -1)
const turnStartWeek = atom({ plugin: 'usage-rail', key: 'turnStartWeek' } as const, -1)
const lastDeltaWeek = atom({ plugin: 'usage-rail', key: 'lastDeltaWeek' } as const, -1)

const CONTEXT_WARN = 50
// Compacting pays off once the conversation is long: from 200k tokens, or half the window
// on smaller models. Below that the summary loses detail and saves little.
const COMPACT_FROM_TOKENS = 200_000
const COMPACT_FROM_PCT = 50

const isCompactWorth = (s: Snapshot) =>
  (s.contextTokens ?? 0) >= COMPACT_FROM_TOKENS || (s.contextPercent ?? 0) >= COMPACT_FROM_PCT

const fiveHourPct = (s: Snapshot) => s.limits.find(l => l.kind === 'five_hour')?.percentUsed
const weekPct = (s: Snapshot) => s.limits.find(l => l.kind === 'seven_day')?.percentUsed

const pickLimits = (list: readonly Limit[]): Limit[] =>
  list.map(({ kind, percentUsed, resetsAt }) => ({ kind, percentUsed, resetsAt }))

const fromUsage = (u: Pick<SessionUsage, 'context' | 'rateLimits' | 'cost'>, prev: Snapshot): Snapshot => ({
  ...prev,
  limits: u.rateLimits.length > 0 ? pickLimits(u.rateLimits) : prev.limits,
  contextTokens: u.context.tokens ?? prev.contextTokens,
  contextWindow: u.context.window,
  contextPercent: u.context.percent ?? prev.contextPercent,
})

// ---------- formatting ----------

const pad = (n: number) => String(n).padStart(2, '0')

const left = (ms: number): string => {
  const min = Math.max(0, Math.round(ms / 60000))
  const d = Math.floor(min / 1440)
  const h = Math.floor((min % 1440) / 60)
  const m = min % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${pad(m)}m`
  return `${m} min`
}

// Time left, then when (hour if within a day, else day + hour).
const resetLines = (resetsAt: string | undefined, at: number): [string, string] => {
  if (!resetsAt || !at) return ['', '']
  const when = new Date(resetsAt)
  const ms = when.getTime() - at
  if (!Number.isFinite(ms)) return ['', '']
  if (ms <= 0) return [L.reset, '']
  const hhmm = `${pad(when.getHours())}:${pad(when.getMinutes())}`
  const date = ms < 86_400_000 ? hhmm : `${L.days[when.getDay()]} ${when.getDate()}, ${hhmm}`
  return [left(ms), date]
}

const tokens = (n: number): string =>
  n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`

// The limits come in whole points (at most one decimal), so a rise under a point reads "<1%".
const deltaText = (d: number): string =>
  d < 0 ? '' : d === 0 ? '+<1%' : d < 1 ? `+${d.toFixed(1)}%` : `+${Math.round(d)}%`

// ---------- drawing ----------

type Ring = {
  label: string
  pct?: number
  line1: string
  line2: string
  accent?: string
  warnAt?: number // amber from here (default 75)
  badge?: string // small figure after the label, e.g. "+3%"
  tip?: string // hover text (drawn as an interactive SVG <title>)
}

const color = (pct: number, accent?: string, warnAt = 75) =>
  pct >= 90 ? '#e5484d' : pct >= warnAt ? '#f0a020' : (accent ?? '#30a46c')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// One row: ring on the left, label and one short line on the right.
const W = 150
const H = 50
const R = 17
const STROKE = 4
const C = 2 * Math.PI * R

const rowSvg = (r: Ring): string => {
  const cx = R + STROKE
  const cy = H / 2
  const tx = cx + R + 12
  const pct = r.pct === undefined ? 0 : Math.max(0, Math.min(100, r.pct))
  const dash = (pct / 100) * C
  const arc =
    r.pct === undefined
      ? ''
      : `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${color(pct, r.accent, r.warnAt)}" stroke-width="${STROKE}"
          stroke-linecap="round" stroke-dasharray="${dash.toFixed(2)} ${C.toFixed(2)}"
          transform="rotate(-90 ${cx} ${cy})"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${r.tip ? `<title>${esc(r.tip)}</title><rect width="${W}" height="${H}" fill="transparent"/>` : ''}
  <style>
    text { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; }
    .track { stroke: #e7e5e0; }
    .pct   { font-size: 10.5px; font-weight: 600; fill: #1f1e1d; }
    .label { font-size: 11.5px; font-weight: 600; fill: #3d3929; }
    .badge { font-size: 10.5px; font-weight: 600; fill: #b5651d; }
    .l1    { font-size: 10.5px; fill: #3d3929; }
    .l2    { font-size: 10.5px; fill: #8a8577; }
    @media (prefers-color-scheme: dark) {
      .track { stroke: #3a3936; }
      .pct   { fill: #f5f4ef; }
      .label { fill: #e8e6dc; }
      .badge { fill: #f0a868; }
      .l1    { fill: #c9c6bb; }
      .l2    { fill: #8f8b80; }
    }
  </style>
  <circle class="track" cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke-width="${STROKE}"/>
  ${arc}
  <text class="pct" x="${cx}" y="${cy + 4}" text-anchor="middle">${r.pct === undefined ? '–' : `${Math.round(pct)}%`}</text>
  <text x="${tx}" y="${cy - 3}"><tspan class="label">${esc(r.label)}</tspan>${
    r.badge ? `<tspan class="badge"> ${esc(r.badge)}</tspan>` : ''
  }</text>
  <text x="${tx}" y="${cy + 11}"><tspan class="l1">${esc(r.line1)}</tspan>${
    r.line2 ? `<tspan class="l2"> · ${esc(r.line2)}</tspan>` : ''
  }</text>
</svg>`
}

const altOf = (r: Ring) =>
  `${r.label}${r.badge ? ` ${r.badge}` : ''}: ${r.pct === undefined ? L.noData : `${r.pct}%`} ${r.line1} ${r.line2}`.trim()

// ---------- actions ----------

async function openCommand($: EngineInterface) {
  const opened = await $.ui.open({ id: PANE, title: L.title, placement: 'widget' })

  return { text: opened.isPlaced ? L.opened : `${L.notOpened} ${opened.reason}` }
}

// Compacts between turns; a press while a turn runs is refused by the engine and reported.
async function compactNow($: EngineInterface) {
  if (await read($, busy)) return
  await update($, busy, () => true)
  try {
    await $.session.compact()
  } catch (err) {
    $.ui.toast(`${L.failed} ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await update($, busy, () => false)
  }
}

// ---------- hooks ----------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    try {
      const usage = await $.session.usage()
      await update($, snap, prev => fromUsage(usage, prev))
    } catch {
      // No figures yet: the first measurement fills them.
    }
    await detectLanguage($)
    await update($, now, () => Date.now())
    $.clock.every(60_000, () => {
      void update($, now, () => Date.now())
    })
    // `/usage` is built in, so the mod's own command is `/usage-rail`.
    await $.command.register({ name: 'usage-rail', description: L.cmd })
    if (L === STRINGS.es || L === STRINGS.pt) await $.command.register({ name: 'uso', description: L.cmd })
    void $.ui.open({ id: PANE, title: L.title, placement: 'widget' })

    return result
  })

  on('command.run', { command: 'usage-rail' }, openCommand)
  on('command.run', { command: 'uso' }, openCommand)

  on('session.measure', async ($, e, next) => {
    const s = await update($, snap, prev => fromUsage(e, prev))
    await update($, now, () => Date.now())
    // Live "+x%": what the 5-hour figure has risen since the current (or last) message began.
    const start = await read($, turnStartPct)
    const cur = fiveHourPct(s)
    if (start >= 0 && cur !== undefined && cur >= start) await update($, lastDelta, () => cur - start)
    const startW = await read($, turnStartWeek)
    const curW = weekPct(s)
    if (startW >= 0 && curW !== undefined && curW >= startW) await update($, lastDeltaWeek, () => curW - startW)

    return next(e)
  })

  // Each message starts its own count from the 5-hour figure as it stands.
  on('turn.start', async ($, e, next) => {
    // Subagents run turns of their own inside a message: they must not restart the count.
    if (e.agentId !== undefined) return next(e)
    const s = await read($, snap)
    await update($, turnStartPct, () => fiveHourPct(s) ?? -1)
    await update($, lastDelta, () => 0)
    await update($, turnStartWeek, () => weekPct(s) ?? -1)
    await update($, lastDeltaWeek, () => 0)

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const els = $.ui.resolve(e)
    const { Box, Button, Text } = els
    // Svg is a desktop/mobile element; the terminal gets plain text instead.
    const Svg = 'Svg' in els ? els.Svg : undefined
    const s = await read($, snap)
    const at = await read($, now)
    const isBusy = await read($, busy)
    const delta = await read($, lastDelta)
    const deltaWeek = await read($, lastDeltaWeek)

    const five = s.limits.find(l => l.kind === 'five_hour')
    const week = s.limits.find(l => l.kind === 'seven_day')
    const [f1, f2] = resetLines(five?.resetsAt, at)
    const [w1, w2] = resetLines(week?.resetsAt, at)

    const ctx: Ring = {
      label: L.context,
      pct: s.contextPercent,
      line1: s.contextTokens !== undefined ? tokens(s.contextTokens) : '',
      line2: s.contextWindow ? `${L.of} ${tokens(s.contextWindow)}` : '',
      accent: '#3e7bfa',
      warnAt: CONTEXT_WARN,
      tip: isCompactWorth(s) ? T.ready : T.early,
    }
    const fiveRing: Ring = {
      label: L.fiveHour,
      pct: five && Math.round(five.percentUsed),
      line1: f1,
      line2: f2,
      badge: deltaText(delta),
    }
    const weekRing: Ring = {
      label: L.weekly,
      pct: week && Math.round(week.percentUsed),
      line1: w1,
      line2: w2,
      badge: deltaText(deltaWeek),
    }

    // Fixed size, so every row draws at the same scale whatever room it has.
    // A row with a tip draws in the interactive frame, where its <title> shows on hover.
    const draw = (r: Ring) =>
      Svg ? (
        <Svg source={rowSvg(r)} alt={altOf(r)} width={W} height={H} isInteractive={r.tip ? true : undefined} />
      ) : (
        <Text>{altOf(r)}</Text>
      )

    // A widget may not take clicks: the button shows only in the full pane.
    const canPress = e.props.placement !== 'widget'

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" alignItems="center" gap={1}>
          {draw(ctx)}
          {/* Pressable only once compacting is worth it; before, a dim label stands in its place. */}
          {canPress && isCompactWorth(s) && (
            <Button key="compact" label={isBusy ? '…' : L.compact} onPress={() => compactNow($)} />
          )}
          {canPress && !isCompactWorth(s) && <Text dimColor>{L.compact}</Text>}
        </Box>
        {draw(fiveRing)}
        {draw(weekRing)}
      </Box>
    )
  })
}
