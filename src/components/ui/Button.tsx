import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
  icon: 'h-10 w-10 p-0 justify-center',
};

function variantStyles(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        background: 'var(--accent)',
        color: '#FFFFFF',
        border: '1px solid var(--accent)',
        boxShadow: 'var(--shadow-sm)',
      };
    case 'secondary':
      return {
        background: 'var(--bg-surface)',
        color: 'var(--ink-primary)',
        border: '1px solid var(--border-strong)',
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--ink-secondary)',
        border: '1px solid transparent',
      };
    case 'danger':
      return {
        background: 'var(--danger)',
        color: '#FFFFFF',
        border: '1px solid var(--danger)',
      };
    case 'soft':
      return {
        background: 'var(--accent-soft)',
        color: 'var(--accent-on-soft)',
        border: '1px solid transparent',
      };
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth,
    loading,
    disabled,
    className = '',
    style,
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center font-medium rounded-[10px]',
        'transition-all duration-150 ease-out',
        'focus:outline-none focus-visible:ring-[3px]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        SIZE[size],
        fullWidth && 'w-full justify-center',
        className
      )}
      style={{
        ...variantStyles(variant),
        // @ts-ignore - css custom property
        '--tw-ring-color': 'var(--accent-ring)',
        ...style,
      }}
      data-variant={variant}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        const el = e.currentTarget;
        if (variant === 'primary') el.style.background = 'var(--accent-hover)';
        if (variant === 'secondary') el.style.background = 'var(--bg-subtle)';
        if (variant === 'ghost') el.style.background = 'var(--bg-subtle)';
        if (variant === 'danger') el.style.background = '#DC2626';
        if (variant === 'soft') el.style.filter = 'brightness(0.97)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        const styles = variantStyles(variant);
        el.style.background = (styles.background as string) || '';
        el.style.filter = '';
      }}
      {...rest}
    >
      {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
      <span>{loading ? 'Loading…' : children}</span>
      {rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
    </button>
  );
});

export default Button;
