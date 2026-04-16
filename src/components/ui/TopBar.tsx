import type { ReactNode } from 'react';
import { Bell, Search } from 'lucide-react';
import { Avatar } from './Avatar';
import { ThemeToggle } from './ThemeToggle';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopBarProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  rightSlot?: ReactNode;
}

export function TopBar({ title, subtitle, breadcrumbs, rightSlot }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-20 h-16 flex items-center justify-between gap-6 px-6 lg:px-8"
      style={{
        background: 'color-mix(in oklab, var(--bg-canvas) 88%, transparent)',
        backdropFilter: 'saturate(180%) blur(8px)',
        WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-baseline gap-3 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1.5 text-[12px]">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5" style={{ color: 'var(--ink-tertiary)' }}>
                {b.href ? (
                  <a href={b.href} className="hover:underline">
                    {b.label}
                  </a>
                ) : (
                  <span>{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
            <span className="mx-2" style={{ color: 'var(--ink-tertiary)' }}>·</span>
          </nav>
        )}
        <div className="min-w-0">
          <h1
            className="text-[22px] font-semibold leading-none truncate"
            style={{ color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          {subtitle && (
            <div className="text-[12px] mt-1" style={{ color: 'var(--ink-secondary)' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search pill */}
        <label
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full text-sm w-[260px]"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            color: 'var(--ink-secondary)',
          }}
        >
          <Search size={15} style={{ color: 'var(--ink-tertiary)' }} />
          <input
            type="text"
            placeholder="Search programs, meetings…"
            className="flex-1 bg-transparent border-none outline-none text-[13px]"
            style={{ color: 'var(--ink-primary)' }}
          />
          <kbd
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--ink-tertiary)',
              border: '1px solid var(--border)',
            }}
          >
            ⌘K
          </kbd>
        </label>

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            color: 'var(--ink-secondary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
        >
          <Bell size={16} />
          <span
            className="absolute top-2 right-2.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--accent)', border: '2px solid var(--bg-surface)' }}
          />
        </button>

        <ThemeToggle />

        {rightSlot}

        <Avatar name="Alex Park" size={32} accent="coral" />
      </div>
    </header>
  );
}

export default TopBar;
