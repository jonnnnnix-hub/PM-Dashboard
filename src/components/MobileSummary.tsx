// MobileSummary — simplified, read-only mobile view of the portfolio.
// Shown on every page below lg breakpoint. Focuses on key dates & priorities.

import { useMemo } from 'react';
import { Flag, Calendar, CheckCircle2 } from 'lucide-react';
import { computeLRMDates, LRM_META, type LRMMilestone } from '../lib/lrm';
import type { Program } from '../types';
import { Card, RagDot } from './ui';

interface DashProgram extends Program {
  latest_rag?: 'green' | 'yellow' | 'red';
}

interface UpcomingEvent {
  programId: string;
  programName: string;
  codename: string;
  kind: LRMMilestone;
  date: Date;
  daysOut: number;
}

function formatShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekday(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function MobileSummary({
  programs,
  pageLabel,
}: {
  programs: DashProgram[];
  pageLabel?: string;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const active = useMemo(
    () => programs.filter((p) => p.status !== 'closed'),
    [programs]
  );

  // Collect all upcoming LRM/launch events across programs, next 90 days, sorted.
  const upcoming = useMemo<UpcomingEvent[]>(() => {
    const events: UpcomingEvent[] = [];
    active.forEach((p) => {
      const dates = computeLRMDates(p.launch_date);
      if (!dates) return;
      (['t60', 't30', 't1', 'launch'] as LRMMilestone[]).forEach((kind) => {
        const date = dates[kind];
        const daysOut = Math.round(
          (date.getTime() - today.getTime()) / 86400000
        );
        if (daysOut >= 0 && daysOut <= 90) {
          events.push({
            programId: p.id,
            programName: p.name,
            codename: p.codename,
            kind,
            date,
            daysOut,
          });
        }
      });
    });
    return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 8);
  }, [active, today]);

  // RAG rollup
  const rag = useMemo(() => {
    const counts = { green: 0, yellow: 0, red: 0, missing: 0 };
    active.forEach((p) => {
      if (!p.latest_rag) counts.missing++;
      else counts[p.latest_rag]++;
    });
    return counts;
  }, [active]);

  // Next event per program for the "priorities" list
  const priorities = useMemo(() => {
    return active
      .map((p) => {
        const dates = computeLRMDates(p.launch_date);
        if (!dates) {
          return { program: p, next: null as null | { kind: LRMMilestone; date: Date; daysOut: number } };
        }
        const kinds: LRMMilestone[] = ['t60', 't30', 't1', 'launch'];
        let next: { kind: LRMMilestone; date: Date; daysOut: number } | null = null;
        for (const k of kinds) {
          const d = dates[k];
          const daysOut = Math.round((d.getTime() - today.getTime()) / 86400000);
          if (daysOut >= 0) {
            next = { kind: k, date: d, daysOut };
            break;
          }
        }
        return { program: p, next };
      })
      .sort((a, b) => {
        // Priority: red > yellow > upcoming soon > green
        const score = (x: typeof a) => {
          if (x.program.latest_rag === 'red') return 0;
          if (x.program.latest_rag === 'yellow') return 1;
          if (x.next && x.next.daysOut <= 7) return 2;
          if (x.next && x.next.daysOut <= 30) return 3;
          return 4;
        };
        const sa = score(a);
        const sb = score(b);
        if (sa !== sb) return sa - sb;
        return (a.next?.daysOut ?? 9999) - (b.next?.daysOut ?? 9999);
      })
      .slice(0, 6);
  }, [active, today]);

  return (
    <div className="space-y-5">
      {pageLabel && (
        <div
          className="text-[11px] uppercase tracking-[0.12em] font-semibold"
          style={{ color: 'var(--ink-tertiary)' }}
        >
          {pageLabel}
        </div>
      )}

      {/* Portfolio health strip */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[15px] font-semibold"
            style={{ color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}
          >
            Portfolio
          </h3>
          <span className="text-[12px]" style={{ color: 'var(--ink-tertiary)' }}>
            {active.length} active
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <HealthCell label="On track" value={rag.green} tone="success" />
          <HealthCell label="At risk" value={rag.yellow} tone="amber" />
          <HealthCell label="Off" value={rag.red} tone="coral" />
          <HealthCell label="No update" value={rag.missing} tone="neutral" />
        </div>
      </Card>

      {/* Upcoming key dates */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[15px] font-semibold inline-flex items-center gap-2"
            style={{ color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}
          >
            <Calendar size={15} style={{ color: 'var(--ink-tertiary)' }} />
            Key dates
          </h3>
          <span className="text-[12px]" style={{ color: 'var(--ink-tertiary)' }}>
            next 90 days
          </span>
        </div>
        {upcoming.length === 0 ? (
          <p
            className="text-[13px] py-6 text-center"
            style={{ color: 'var(--ink-tertiary)' }}
          >
            No launches or memos scheduled in the next 90 days.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {upcoming.map((e, i) => (
              <li
                key={`${e.programId}-${e.kind}-${i}`}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: 'var(--bg-subtle)',
                }}
              >
                {/* Date chip */}
                <div
                  className="flex-shrink-0 w-[54px] h-[54px] rounded-xl flex flex-col items-center justify-center"
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid var(--border-subtle)`,
                  }}
                >
                  <div
                    className="text-[10px] uppercase tracking-wide font-semibold"
                    style={{ color: 'var(--ink-tertiary)' }}
                  >
                    {formatWeekday(e.date)}
                  </div>
                  <div
                    className="text-[15px] font-bold tabular leading-none mt-0.5"
                    style={{ color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}
                  >
                    {e.date.getDate()}
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-wide"
                    style={{ color: 'var(--ink-tertiary)' }}
                  >
                    {e.date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide tabular px-1.5 py-0.5 rounded"
                      style={{
                        color: '#fff',
                        background: LRM_META[e.kind].accent,
                      }}
                    >
                      {LRM_META[e.kind].short}
                    </span>
                    <span
                      className="text-[11px] font-medium tabular"
                      style={{
                        color: e.daysOut <= 7 ? 'var(--coral)' : 'var(--ink-tertiary)',
                      }}
                    >
                      {e.daysOut === 0
                        ? 'today'
                        : e.daysOut === 1
                        ? 'tomorrow'
                        : `in ${e.daysOut}d`}
                    </span>
                  </div>
                  <div
                    className="text-[13px] font-medium truncate"
                    style={{ color: 'var(--ink-primary)' }}
                  >
                    {e.programName}
                  </div>
                  <div
                    className="text-[11px] font-mono truncate"
                    style={{ color: 'var(--ink-tertiary)' }}
                  >
                    {e.codename}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Priorities */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-[15px] font-semibold inline-flex items-center gap-2"
            style={{ color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}
          >
            <Flag size={15} style={{ color: 'var(--ink-tertiary)' }} />
            Priorities
          </h3>
          <span className="text-[12px]" style={{ color: 'var(--ink-tertiary)' }}>
            needs attention
          </span>
        </div>
        {priorities.length === 0 ? (
          <div
            className="py-6 text-center text-[13px] inline-flex flex-col items-center gap-2 w-full"
            style={{ color: 'var(--ink-tertiary)' }}
          >
            <CheckCircle2 size={22} style={{ color: 'var(--teal)' }} />
            All clear. Nothing flagged.
          </div>
        ) : (
          <ul className="space-y-2">
            {priorities.map(({ program, next }) => {
              const rag = program.latest_rag;
              const accent =
                rag === 'red'
                  ? 'var(--coral)'
                  : rag === 'yellow'
                  ? 'var(--amber)'
                  : rag === 'green'
                  ? 'var(--teal)'
                  : 'var(--border-strong)';
              return (
                <li
                  key={program.id}
                  className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <RagDot rag={rag ?? 'green'} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: 'var(--ink-primary)' }}
                    >
                      {program.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: 'var(--ink-tertiary)' }}
                      >
                        {program.codename}
                      </span>
                      {next && (
                        <>
                          <span
                            className="text-[10px]"
                            style={{ color: 'var(--ink-tertiary)' }}
                          >
                            •
                          </span>
                          <span
                            className="text-[11px] tabular"
                            style={{ color: 'var(--ink-secondary)' }}
                          >
                            {LRM_META[next.kind].short} {formatShort(next.date)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {rag && (
                    <div
                      className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        color: accent,
                        background: 'var(--bg-subtle)',
                        border: `1px solid ${accent}`,
                      }}
                    >
                      {rag}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Footer note */}
      <div
        className="text-center text-[11px] px-4 pb-2"
        style={{ color: 'var(--ink-tertiary)' }}
      >
        Open on desktop for full tools, editing, and analytics.
      </div>
    </div>
  );
}

function HealthCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'amber' | 'coral' | 'neutral';
}) {
  const color =
    tone === 'success'
      ? 'var(--teal)'
      : tone === 'amber'
      ? 'var(--amber)'
      : tone === 'coral'
      ? 'var(--coral)'
      : 'var(--ink-tertiary)';
  return (
    <div
      className="flex flex-col items-center justify-center py-3 rounded-xl"
      style={{ background: 'var(--bg-subtle)' }}
    >
      <div
        className="text-[22px] font-bold tabular leading-none"
        style={{ color, letterSpacing: '-0.02em' }}
      >
        {value}
      </div>
      <div
        className="text-[10px] uppercase tracking-wide font-semibold mt-1.5 text-center px-1"
        style={{ color: 'var(--ink-tertiary)' }}
      >
        {label}
      </div>
    </div>
  );
}
