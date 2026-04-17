interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
  showValue?: boolean;
  /** Indeterminate shimmer when true */
  indeterminate?: boolean;
}

export function ProgressBar({
  value,
  label,
  size = 'md',
  showValue = true,
  indeterminate = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const h = size === 'sm' ? 4 : 6;

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--ink-secondary)' }}
            >
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span
              className="text-xs tabular font-semibold"
              style={{ color: 'var(--coral-ink)' }}
            >
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden relative"
        style={{
          height: h,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
        }}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        {indeterminate ? (
          <div
            className="absolute top-0 h-full rounded-full animate-progress-indeterminate"
            style={{
              width: '40%',
              background:
                'linear-gradient(90deg, var(--coral-soft) 0%, var(--coral-solid) 50%, var(--coral-soft) 100%)',
            }}
          />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{
              width: `${clamped}%`,
              background:
                'linear-gradient(90deg, var(--coral-solid) 0%, color-mix(in oklab, var(--coral-solid) 80%, white) 100%)',
            }}
          >
            {/* Shimmer overlay while not at 100% */}
            {clamped < 100 && (
              <div
                className="absolute inset-0 animate-progress-shimmer"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressBar;
