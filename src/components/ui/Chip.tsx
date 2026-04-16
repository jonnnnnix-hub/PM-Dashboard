import type { ReactNode } from 'react';
import { ACCENT_VAR, STATUS_VAR, cn, type ToneName } from './tokens';

interface ChipProps {
  tone?: ToneName | 'neutral';
  children: ReactNode;
  icon?: ReactNode;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE = {
  xs: 'h-5 px-2 text-[10px] gap-1',
  sm: 'h-6 px-2.5 text-[11px] gap-1.5',
  md: 'h-7 px-3 text-[12px] gap-1.5',
};

function chipStyles(tone: ToneName | 'neutral'): React.CSSProperties {
  if (tone === 'neutral') {
    return {
      background: 'var(--bg-subtle)',
      color: 'var(--ink-secondary)',
    };
  }
  if (tone in ACCENT_VAR) {
    const v = ACCENT_VAR[tone as keyof typeof ACCENT_VAR];
    return { background: v.soft, color: v.ink };
  }
  const s = STATUS_VAR[tone as keyof typeof STATUS_VAR];
  return { background: s.soft, color: s.solid };
}

export function Chip({ tone = 'neutral', children, icon, size = 'sm', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold whitespace-nowrap',
        SIZE[size],
        className
      )}
      style={chipStyles(tone)}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children}
    </span>
  );
}

interface DeltaChipProps {
  value: number;
  unit?: string;
  reverse?: boolean; // when true, negative is good (e.g. error rate)
}

export function DeltaChip({ value, unit = '%', reverse }: DeltaChipProps) {
  const positive = reverse ? value < 0 : value > 0;
  const tone: ToneName = value === 0 ? 'success' : positive ? 'success' : 'danger';
  const arrow = value === 0 ? '·' : value > 0 ? '↑' : '↓';
  return (
    <Chip tone={tone} size="xs">
      <span className="tabular">{arrow} {Math.abs(value)}{unit}</span>
    </Chip>
  );
}

export default Chip;
