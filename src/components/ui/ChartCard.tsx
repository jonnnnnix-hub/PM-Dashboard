import type { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from './tokens';

interface ChartCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  height?: number;
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  height = 240,
}: ChartCardProps) {
  return (
    <Card padding="md" className={cn('flex flex-col', className)}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3
            className="text-[15px] font-semibold leading-tight"
            style={{ color: 'var(--ink-primary)' }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div style={{ width: '100%', height }}>{children}</div>
    </Card>
  );
}

export default ChartCard;
