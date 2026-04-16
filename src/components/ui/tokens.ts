/**
 * Centralized accent token map. Use these names as the `accent` prop on
 * StatTile, Chip, ChartCard, etc. Each maps to CSS variables defined in
 * `src/index.css`.
 */
export type AccentName =
  | 'coral'
  | 'amber'
  | 'teal'
  | 'indigo'
  | 'rose'
  | 'sky';

export const ACCENTS: AccentName[] = ['coral', 'amber', 'teal', 'indigo', 'rose', 'sky'];

export type StatusName = 'success' | 'warning' | 'danger';

export type ToneName = AccentName | StatusName;

export const ACCENT_VAR: Record<AccentName, { solid: string; soft: string; ink: string }> = {
  coral:  { solid: 'var(--coral)',  soft: 'var(--coral-soft)',  ink: 'var(--coral-ink)'  },
  amber:  { solid: 'var(--amber)',  soft: 'var(--amber-soft)',  ink: 'var(--amber-ink)'  },
  teal:   { solid: 'var(--teal)',   soft: 'var(--teal-soft)',   ink: 'var(--teal-ink)'   },
  indigo: { solid: 'var(--indigo)', soft: 'var(--indigo-soft)', ink: 'var(--indigo-ink)' },
  rose:   { solid: 'var(--rose)',   soft: 'var(--rose-soft)',   ink: 'var(--rose-ink)'   },
  sky:    { solid: 'var(--sky)',    soft: 'var(--sky-soft)',    ink: 'var(--sky-ink)'    },
};

export const STATUS_VAR: Record<StatusName, { solid: string; soft: string }> = {
  success: { solid: 'var(--success)', soft: 'var(--success-soft)' },
  warning: { solid: 'var(--warning)', soft: 'var(--warning-soft)' },
  danger:  { solid: 'var(--danger)',  soft: 'var(--danger-soft)'  },
};

export function toneVars(tone: ToneName): { solid: string; soft: string; ink: string } {
  if (tone in ACCENT_VAR) return ACCENT_VAR[tone as AccentName];
  const s = STATUS_VAR[tone as StatusName];
  return { solid: s.solid, soft: s.soft, ink: s.solid };
}

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
