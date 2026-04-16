import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './tokens';

const FIELD_BASE =
  'w-full rounded-[10px] text-sm placeholder:text-[color:var(--ink-tertiary)] ' +
  'focus:outline-none transition-colors';

function fieldStyle(): React.CSSProperties {
  return {
    background: 'var(--bg-surface)',
    color: 'var(--ink-primary)',
    border: '1px solid var(--border-strong)',
  };
}

function applyFocus(e: React.FocusEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = 'var(--accent)';
  el.style.boxShadow = '0 0 0 3px var(--accent-ring)';
}
function applyBlur(e: React.FocusEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = 'var(--border-strong)';
  el.style.boxShadow = 'none';
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  /** Compact pill height (32px) */
  compact?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, rightSlot, compact, className = '', style, onFocus, onBlur, ...rest },
  ref
) {
  if (leftIcon || rightSlot) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-[10px] transition-colors',
          compact ? 'h-8 px-3' : 'h-10 px-3',
          className
        )}
        style={{ ...fieldStyle(), ...style }}
        onFocus={(e) => applyFocus(e as React.FocusEvent<HTMLElement>)}
        onBlur={(e) => applyBlur(e as React.FocusEvent<HTMLElement>)}
      >
        {leftIcon && (
          <span className="flex-shrink-0" style={{ color: 'var(--ink-tertiary)' }}>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[color:var(--ink-tertiary)]"
          style={{ color: 'var(--ink-primary)' }}
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        />
        {rightSlot}
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(FIELD_BASE, compact ? 'h-8 px-3' : 'h-10 px-3', className)}
      style={{ ...fieldStyle(), ...style }}
      onFocus={(e) => {
        applyFocus(e);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        applyBlur(e);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', style, onFocus, onBlur, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(FIELD_BASE, 'min-h-[96px] py-2.5 px-3 leading-relaxed resize-y', className)}
      style={{ ...fieldStyle(), ...style }}
      onFocus={(e) => {
        applyFocus(e);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        applyBlur(e);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = '', style, compact, children, onFocus, onBlur, ...rest },
  ref
) {
  return (
    <div className="relative inline-block w-full">
      <select
        ref={ref}
        className={cn(
          FIELD_BASE,
          'appearance-none pr-9 pl-3',
          compact ? 'h-8' : 'h-10',
          className
        )}
        style={{ ...fieldStyle(), ...style }}
        onFocus={(e) => {
          applyFocus(e);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          applyBlur(e);
          onBlur?.(e);
        }}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--ink-tertiary)' }}
      />
    </div>
  );
});

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, required, children, className = '' }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span
          className="block text-[12px] font-semibold mb-1.5"
          style={{ color: 'var(--ink-secondary)' }}
        >
          {label}
          {required && <span style={{ color: 'var(--accent)' }}> *</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="block text-xs mt-1" style={{ color: 'var(--danger)' }}>
          {error}
        </span>
      ) : hint ? (
        <span className="block text-xs mt-1" style={{ color: 'var(--ink-tertiary)' }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export default Input;
