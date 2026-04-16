import type { ReactNode } from 'react';
import { ACCENT_VAR, type AccentName } from './tokens';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  accent?: AccentName;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  accent = 'coral',
  action,
  className = '',
}: EmptyStateProps) {
  const tone = ACCENT_VAR[accent];
  return (
    <div className={`flex flex-col items-center text-center py-14 px-6 ${className}`}>
      {icon && (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: tone.soft, color: tone.ink }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-base font-semibold mb-1.5"
        style={{ color: 'var(--ink-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm max-w-md leading-relaxed"
          style={{ color: 'var(--ink-secondary)' }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
