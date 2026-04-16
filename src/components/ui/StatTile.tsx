import type { ReactNode } from 'react';
import { Card } from './Card';
import { ACCENT_VAR, type AccentName, cn } from './tokens';
import { DeltaChip } from './Chip';

interface StatTileProps {
  label: string;
  value: ReactNode;
  unit?: string;
  accent?: AccentName;
  icon?: ReactNode;
  delta?: number;
  deltaUnit?: string;
  /** Sparkline rendered to the right (e.g. a Recharts <LineChart>) */
  spark?: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function StatTile({
  label,
  value,
  unit,
  accent = 'coral',
  icon,
  delta,
  deltaUnit,
  spark,
  hint,
  className,
}: StatTileProps) {
  const tone = ACCENT_VAR[accent];
  return (
    <Card padding="md" className={cn('relative overflow-hidden', className)}>
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: tone.soft, color: tone.ink }}
          aria-hidden
        >
          {icon}
        </div>
        <div className="label-micro min-w-0 truncate">{label}</div>
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[30px] font-bold tabular leading-none"
          style={{ color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--ink-tertiary)' }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Footer: delta + hint */}
      {(typeof delta === 'number' || hint) && (
        <div className="flex items-center gap-2 mt-2">
          {typeof delta === 'number' && <DeltaChip value={delta} unit={deltaUnit ?? '%'} />}
          {hint && (
            <span
              className="text-xs truncate"
              style={{ color: 'var(--ink-secondary)' }}
            >
              {hint}
            </span>
          )}
        </div>
      )}

      {/* Sparkline pinned to bottom-right so it never crowds the label */}
      {spark && (
        <div
          className="absolute right-3 bottom-3 w-16 h-8 pointer-events-none opacity-70"
          aria-hidden
        >
          {spark}
        </div>
      )}
    </Card>
  );
}

export default StatTile;
