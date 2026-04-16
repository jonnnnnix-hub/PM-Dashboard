import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  Flag,
} from 'lucide-react';
import type { WeeklyStatus } from '../types';
import { Shell } from '../components/ui/Shell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { RagDot } from '../components/ui/RagDot';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { StatTile } from '../components/ui/StatTile';
import { ACCENT_VAR, type AccentName } from '../components/ui/tokens';

const PROGRAM_ACCENTS: AccentName[] = ['coral', 'amber', 'teal', 'indigo', 'rose', 'sky'];
const accentFor = (id: string) => PROGRAM_ACCENTS[
  id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PROGRAM_ACCENTS.length
];

export default function WeeklyTracker() {
  const { programs, currentWeek, setCurrentWeek, getWeekStart } = useApp();
  const [weeklyStatuses] = useState<Record<string, WeeklyStatus>>({});
  const [notes, setNotes] = useState('');

  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const isCurrentWeek = weekStart.getTime() === getWeekStart(new Date()).getTime();

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(next);
  };

  const statusList = Object.values(weeklyStatuses);
  const submittedCount = statusList.filter(s => s.overall_rag).length;

  const ragCounts = useMemo(() => {
    const counts = { green: 0, yellow: 0, red: 0, missing: 0 };
    programs.forEach(p => {
      const s = weeklyStatuses[p.id];
      if (!s) counts.missing++;
      else counts[s.overall_rag]++;
    });
    return counts;
  }, [programs, weeklyStatuses]);

  const totalRisks = statusList.reduce((sum, s) => sum + (s.risks_issues?.length || 0), 0);
  const totalBlockers = statusList.reduce((sum, s) => sum + (s.blockers?.length || 0), 0);

  const rightRail = (
    <div className="space-y-4">
      <Card padding="md">
        <CardHeader
          title="Manager notes"
          subtitle="Topics to raise at your next 1:1"
          icon={<FileText size={16} />}
        />
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Capture open questions, asks, and escalations for your 1:1…"
          className="w-full h-44 text-sm rounded-lg p-3 resize-none focus-ring"
          style={{
            background: 'var(--bg-canvas)',
            color: 'var(--ink-primary)',
            border: '1px solid var(--border)',
          }}
        />
        <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--ink-tertiary)' }}>
          <span>Saved locally</span>
          <span>{notes.length} chars</span>
        </div>
      </Card>

      <Card padding="md">
        <CardHeader
          title="Brief preview"
          subtitle="What the AI will include"
          icon={<Sparkles size={16} />}
        />
        <ul className="space-y-2 text-sm" style={{ color: 'var(--ink-secondary)' }}>
          {[
            'Bandwidth allocation summary',
            'Portfolio RAG roll-up',
            'Program-by-program highlights',
            'Aggregated risks & escalations',
            'Recommended 1:1 discussion topics',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--teal-solid)' }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  const topBarRight = (
    <Button variant="primary" size="sm" leftIcon={<Sparkles size={14} />}>
      Generate 1:1 brief
    </Button>
  );

  return (
    <Shell
      title="Weekly 1:1 Tracker"
      subtitle="Cross-program weekly reporting for manager check-ins"
      breadcrumbs={[{ label: 'Reporting' }, { label: 'Weekly 1:1' }]}
      topBarRight={topBarRight}
      rightRail={rightRail}
    >
      <div className="space-y-6">
        {/* Week navigator */}
        <Card padding="md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevWeek}
                className="w-9 h-9 rounded-lg flex items-center justify-center focus-ring transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--ink-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ChevronLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} style={{ color: 'var(--ink-tertiary)' }} />
                  <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {formatDate(weekStart.toISOString())} — {formatDate(weekEnd.toISOString())}
                  </div>
                  {isCurrentWeek && <Chip tone="coral" size="xs">Current week</Chip>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
                  {submittedCount} of {programs.length} statuses submitted
                </div>
              </div>
              <button
                onClick={handleNextWeek}
                className="w-9 h-9 rounded-lg flex items-center justify-center focus-ring transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--ink-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
              disabled={isCurrentWeek}
            >
              Jump to this week
            </Button>
          </div>
        </Card>

        {/* KPI tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatTile
            label="Submitted"
            value={submittedCount}
            unit={`/ ${programs.length}`}
            accent="teal"
            icon={<CheckCircle2 size={16} />}
            hint={programs.length ? `${Math.round((submittedCount / programs.length) * 100)}% complete` : 'No programs yet'}
          />
          <StatTile
            label="Portfolio RAG"
            value={ragCounts.green}
            unit={`G · ${ragCounts.yellow}Y · ${ragCounts.red}R`}
            accent="coral"
            icon={<Flag size={16} />}
            hint={`${ragCounts.missing} missing`}
          />
          <StatTile
            label="Open risks"
            value={totalRisks}
            accent="amber"
            icon={<AlertTriangle size={16} />}
            hint="Across all programs"
          />
          <StatTile
            label="Blockers"
            value={totalBlockers}
            accent="rose"
            icon={<AlertTriangle size={16} />}
            hint="Need escalation"
          />
        </div>

        {/* Program timeline / table */}
        <Card padding="none">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
                Program status roll-up
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
                Timeline view of every program for the selected week
              </div>
            </div>
            <Chip tone="neutral" size="sm">
              {programs.length} program{programs.length === 1 ? '' : 's'}
            </Chip>
          </div>

          {programs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FileText size={24} />}
                title="No programs yet"
                description="Create your first program to start tracking weekly status."
                accent="coral"
              />
            </div>
          ) : (
            <div>
              {programs.map((program, idx) => {
                const status = weeklyStatuses[program.id];
                const accent = accentFor(program.id);
                const v = ACCENT_VAR[accent];
                const isLast = idx === programs.length - 1;
                return (
                  <div
                    key={program.id}
                    className="px-5 py-4 transition-colors"
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="grid grid-cols-12 gap-4 items-start">
                      {/* Program identity */}
                      <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                        <div
                          className="w-1 self-stretch rounded-full min-h-[40px]"
                          style={{ background: v.solid }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold truncate" style={{ color: 'var(--ink-primary)' }}>
                            {program.name}
                          </div>
                          <div className="text-xs font-mono mt-0.5 tabular" style={{ color: 'var(--ink-tertiary)' }}>
                            {program.codename}
                          </div>
                        </div>
                      </div>

                      {/* RAG + summary */}
                      <div className="col-span-12 md:col-span-5 flex items-start gap-3">
                        {status ? (
                          <RagDot rag={status.overall_rag} size={10} />
                        ) : (
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                            style={{ background: 'var(--border-strong)' }}
                          />
                        )}
                        <div className="text-sm clamp-2" style={{ color: 'var(--ink-secondary)' }}>
                          {status?.summary || (
                            <span style={{ color: 'var(--ink-tertiary)' }}>
                              No status captured for this week
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Counts */}
                      <div className="col-span-8 md:col-span-3 flex items-center gap-2 flex-wrap">
                        {status?.risks_issues?.length ? (
                          <Chip tone="amber" size="xs" icon={<AlertTriangle size={10} />}>
                            {status.risks_issues.length} risk{status.risks_issues.length === 1 ? '' : 's'}
                          </Chip>
                        ) : null}
                        {status?.blockers?.length ? (
                          <Chip tone="danger" size="xs" icon={<AlertTriangle size={10} />}>
                            {status.blockers.length} blocker{status.blockers.length === 1 ? '' : 's'}
                          </Chip>
                        ) : null}
                        {status?.decisions_needed?.length ? (
                          <Chip tone="indigo" size="xs">
                            {status.decisions_needed.length} decision{status.decisions_needed.length === 1 ? '' : 's'}
                          </Chip>
                        ) : null}
                        {!status && (
                          <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>—</span>
                        )}
                      </div>

                      {/* Submitted indicator + owner */}
                      <div className="col-span-4 md:col-span-1 flex items-center justify-end gap-2">
                        {status ? (
                          <Chip tone="success" size="xs" icon={<CheckCircle2 size={10} />}>
                            Done
                          </Chip>
                        ) : (
                          <Chip tone="warning" size="xs" icon={<AlertTriangle size={10} />}>
                            Missing
                          </Chip>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 ml-4">
                      <Avatar name={program.owner || 'Alex Park'} size={24} accent={accent} />
                      <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                        {program.owner || 'Unassigned'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                        Launch readiness T-14: 6/8 gates
                      </span>
                      {!status && (
                        <Button variant="ghost" size="sm" className="ml-auto">
                          + Add status
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
