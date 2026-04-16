import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './tokens';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  hover?: boolean;
  /** Visually elevated card (deeper shadow). */
  elevated?: boolean;
  /** No border (used when sitting inside another card). */
  flat?: boolean;
  children?: ReactNode;
}

const PADDING: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = 'md', hover, elevated, flat, className = '', style, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-colors',
        PADDING[padding],
        hover && 'card-hover cursor-pointer',
        className
      )}
      style={{
        background: 'var(--bg-surface)',
        border: flat ? 'none' : '1px solid var(--border)',
        boxShadow: elevated ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, icon, action, className = '' }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-subtle)', color: 'var(--ink-secondary)' }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {title && (
            <h3
              className="text-[15px] font-semibold leading-tight truncate"
              style={{ color: 'var(--ink-primary)' }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export default Card;
