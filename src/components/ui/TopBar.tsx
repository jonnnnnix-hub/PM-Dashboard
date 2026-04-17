import type { ReactNode } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
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
  onOpenMobileNav?: () => void;
}

export function TopBar({ title, subtitle, breadcrumbs, rightSlot, onOpenMobileNav }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-20 h-14 md:h-16 flex items-center justify-between gap-2 md:gap-6 px-3 md:px-6 lg:px-8"
      style={{
        background: 'color-mix(in oklab, var(--bg-canvas) 88%, transparent)',
        backdropFilter: 'saturate(180%) blur(8px)',
        WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: hamburger (mobile) + brand (mobile) + title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="md:hidden flex-shrink-0 w-9 h-9 -ml-1 inline-flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--ink-secondary)' }}
          onClick={onOpenMobileNav}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>



        {/* Breadcrumbs — desktop only */}
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

        {/* Title block */}
        <div className="min-w-0 flex-1">
          <h1
            className="text-[16px] md:text-[22px] font-semibold leading-tight truncate"
            style={{ color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          {subtitle && (
            <div
              className="hidden md:block text-[12px] mt-1 truncate"
              style={{ color: 'var(--ink-secondary)' }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
        {/* Search pill — desktop only */}
        <label
          className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-full text-sm w-[220px] xl:w-[260px]"
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
            className="flex-1 bg-transparent border-none outline-none text-[13px] min-w-0"
            style={{ color: 'var(--ink-primary)' }}
          />
          <kbd
            className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
            style={{
              background: 'var(--bg-subtle)',
              color: 'var(--ink-tertiary)',
              border: '1px solid var(--border)',
            }}
          >
            ⌘K
          </kbd>
        </label>

        {/* Notification bell — xl+ only (rarely needed, saves space) */}
        <button
          aria-label="Notifications"
          className="hidden xl:inline-flex relative w-10 h-10 items-center justify-center rounded-full transition-colors flex-shrink-0"
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

        {rightSlot && <div className="flex items-center gap-1.5 md:gap-2">{rightSlot}</div>}

        {/* Avatar — md+ (mobile user accesses profile via sidebar drawer) */}
        <div className="hidden md:block">
          <Avatar name="Alex Park" size={32} accent="coral" />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
