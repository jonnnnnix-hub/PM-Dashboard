interface LogoProps {
  size?: number;
  className?: string;
  /** Show the "LPMO" wordmark beside the mark. */
  withWordmark?: boolean;
}

/**
 * Geometric L-monogram with a coral dot accent.
 * Uses currentColor for stroke so it inherits text color.
 */
export function Logo({ size = 28, className = '', withWordmark = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        role="img"
      >
        <rect width="32" height="32" rx="8" fill="var(--accent)" />
        <path
          d="M9 7v18h14"
          stroke="white"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="23" cy="9" r="2.6" fill="white" />
      </svg>
      {withWordmark && (
        <span
          style={{
            fontFamily: "Fraunces, ui-serif, Georgia, serif",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: '-0.01em',
            color: 'var(--ink-primary)',
          }}
        >
          LPMO
        </span>
      )}
    </span>
  );
}

export default Logo;
