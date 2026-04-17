// Launch Readiness Memo date helpers
// Calendar days (NOT business days) - intentional choice.

export interface LRMDates {
  t60: Date;
  t30: Date;
  t1: Date;
  launch: Date;
}

export function computeLRMDates(launchDate: string | Date | null | undefined): LRMDates | null {
  if (!launchDate) return null;
  const d = typeof launchDate === 'string'
    ? new Date(launchDate.length === 10 ? launchDate + 'T00:00:00' : launchDate)
    : new Date(launchDate);
  if (isNaN(d.getTime())) return null;
  const day = 86400000;
  return {
    t60: new Date(d.getTime() - 60 * day),
    t30: new Date(d.getTime() - 30 * day),
    t1:  new Date(d.getTime() -  1 * day),
    launch: d,
  };
}

export type LRMMilestone = 't60' | 't30' | 't1' | 'launch';

export const LRM_META: Record<LRMMilestone, { label: string; short: string; accent: string; desc: string }> = {
  t60: { label: 'T-60 LRM',   short: 'T-60',   accent: 'var(--amber)',  desc: 'Launch Readiness Memo — 60 days out' },
  t30: { label: 'T-30 LRM',   short: 'T-30',   accent: 'var(--coral)',  desc: 'Launch Readiness Memo — 30 days out' },
  t1:  { label: 'T-1 LRM',    short: 'T-1',    accent: 'var(--rose)',   desc: 'Final Launch Readiness Memo — day before launch' },
  launch: { label: 'Launch',  short: 'LAUNCH', accent: 'var(--coral)',  desc: 'Launch day' },
};
