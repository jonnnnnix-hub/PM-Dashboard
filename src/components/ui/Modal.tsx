import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fadein"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${SIZES[size]} max-h-[94vh] sm:max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl flex flex-col animate-slideup sm:animate-fadein`}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div
            className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 md:py-5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="min-w-0">
              {title && (
                <h2
                  className="text-lg font-semibold leading-tight"
                  style={{ color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex-shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'var(--ink-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 md:py-5">{children}</div>
        {footer && (
          <div
            className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 px-5 md:px-6 py-3 md:py-4"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
