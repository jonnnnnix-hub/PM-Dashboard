import { Calendar, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Program, RAGStatus, ProgramType } from '../types';
import { Card, Chip, Avatar, RagDot } from './ui';
import type { AccentName } from './ui';

interface ProgramCardProps {
  program: Program & {
    latest_rag?: RAGStatus;
    latest_summary?: string;
    gate_progress?: { current_gate: string; completed: number; total: number };
    unreviewed_meetings?: number;
    overdue_gate?: boolean;
  };
}

const TYPE_ACCENT: Record<ProgramType, AccentName> = {
  migration: 'indigo',
  'price-increase': 'teal',
  'market-rollout': 'rose',
  other: 'sky',
};

const TYPE_LABEL: Record<ProgramType, string> = {
  migration: 'Migration',
  'price-increase': 'Price Increase',
  'market-rollout': 'Market Rollout',
  other: 'Other',
};

function getDaysUntilLaunch(launchDate: string): number {
  const launch = new Date(launchDate);
  const now = new Date();
  return Math.ceil((launch.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProgramCard({ program }: ProgramCardProps) {
  const days = getDaysUntilLaunch(program.launch_date);
  const isOverdue = days < 0 && program.status === 'in-flight';
  const accent = TYPE_ACCENT[program.program_type];
  const progress = program.gate_progress;
  const pct = progress && progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <Link to={`/program/${program.id}`} className="block group focus:outline-none">
      <Card padding="md" hover className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <RagDot rag={program.latest_rag} />
              <h3
                className="text-[15px] font-semibold leading-tight truncate"
                style={{ color: 'var(--ink-primary)' }}
              >
                {program.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-mono"
                style={{ color: 'var(--ink-tertiary)' }}
              >
                {program.codename}
              </span>
              <Chip tone={accent} size="xs">{TYPE_LABEL[program.program_type]}</Chip>
            </div>
          </div>
          <ArrowUpRight
            size={18}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--accent)' }}
          />
        </div>

        {/* Summary */}
        {program.latest_summary ? (
          <p
            className="text-[13px] leading-relaxed clamp-2 mb-4"
            style={{ color: 'var(--ink-secondary)' }}
          >
            {program.latest_summary}
          </p>
        ) : (
          <p
            className="text-[13px] italic mb-4"
            style={{ color: 'var(--ink-tertiary)' }}
          >
            No status update this week.
          </p>
        )}

        {/* Gate progress */}
        {progress && progress.total > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium" style={{ color: 'var(--ink-secondary)' }}>
                {progress.current_gate}
              </span>
              <span className="text-[11px] tabular font-semibold" style={{ color: 'var(--ink-primary)' }}>
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-subtle)' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: program.overdue_gate ? 'var(--danger)' : 'var(--accent)',
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Avatar name={program.owner || 'Unassigned'} size={24} />
            <div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--ink-primary)' }}>
                {program.owner || 'Unassigned'}
              </div>
              <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--ink-tertiary)' }}>
                <Calendar size={9} />
                <span className={isOverdue ? '' : ''} style={isOverdue ? { color: 'var(--danger)' } : undefined}>
                  {days > 0 ? `T-${days}d` : days === 0 ? 'Launch day' : `Launched ${Math.abs(days)}d ago`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {program.overdue_gate && (
              <Chip tone="danger" size="xs" icon={<AlertTriangle size={10} />}>
                Overdue
              </Chip>
            )}
            {program.unreviewed_meetings ? (
              <Chip tone="amber" size="xs" icon={<Clock size={10} />}>
                {program.unreviewed_meetings}
              </Chip>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default ProgramCard;
