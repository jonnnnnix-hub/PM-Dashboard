import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  CalendarDays,
  Mic,
  Newspaper,
  GanttChart,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { ACCENT_VAR, type AccentName } from './tokens';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  accent: AccentName;
}

const NAV: NavItem[] = [
  { name: 'Dashboard',  href: '/',          icon: LayoutDashboard, accent: 'coral' },
  { name: 'Bandwidth',  href: '/bandwidth', icon: Activity,        accent: 'amber' },
  { name: 'Weekly 1:1s',href: '/weekly',    icon: CalendarDays,    accent: 'teal' },
  { name: 'Meetings',   href: '/meetings',  icon: Mic,             accent: 'indigo' },
  { name: 'Digest',     href: '/digest',    icon: Newspaper,       accent: 'rose' },
  { name: 'Timeline',   href: '/timeline',  icon: GanttChart,      accent: 'amber' },
  { name: 'Settings',   href: '/settings',  icon: SettingsIcon,    accent: 'sky' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <>
      {/* Brand */}
      <div className="px-5 pt-6 pb-7 flex items-center justify-between">
        <Link
          to="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-2.5"
          aria-label="LPMO home"
        >
          <Logo size={32} />
          <div>
            <div
              style={{
                fontFamily: 'Fraunces, ui-serif, Georgia, serif',
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: '-0.01em',
                color: 'var(--ink-primary)',
                lineHeight: 1,
              }}
            >
              LPMO
            </div>
            <div
              className="mt-1 text-[11px] font-medium tracking-wide"
              style={{ color: 'var(--ink-tertiary)' }}
            >
              Command Center
            </div>
          </div>
        </Link>
      </div>

      {/* Section label */}
      <div className="px-5 pb-2">
        <span className="label-micro">Workspace</span>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const tone = ACCENT_VAR[item.accent];
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className="group relative flex items-center gap-3 rounded-xl pl-3 pr-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: isActive ? tone.soft : 'transparent',
                    color: isActive ? tone.ink : 'var(--ink-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all"
                    style={{
                      width: isActive ? 3 : 0,
                      height: isActive ? 22 : 0,
                      background: tone.solid,
                    }}
                  />
                  <item.icon
                    size={18}
                    style={{ color: isActive ? tone.solid : 'var(--ink-tertiary)' }}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User chip */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex items-center gap-3 rounded-xl px-2.5 py-2"
          style={{ background: 'var(--bg-subtle)' }}
        >
          <Avatar name="Alex Park" size={32} accent="coral" status="online" />
          <div className="flex-1 min-w-0">
            <div
              className="text-[13px] font-semibold truncate"
              style={{ color: 'var(--ink-primary)' }}
            >
              Alex Park
            </div>
            <div className="text-[11px] truncate" style={{ color: 'var(--ink-tertiary)' }}>
              Program Lead
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  // Close on Escape + lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-[240px] flex-col z-30"
        style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
        }}
        aria-label="Primary navigation"
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 animate-fadein"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside
            className="md:hidden fixed inset-y-0 left-0 w-[280px] max-w-[85vw] flex flex-col z-50 animate-slidein-left"
            style={{
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border)',
            }}
            aria-label="Primary navigation"
          >
            <button
              type="button"
              aria-label="Close navigation"
              onClick={onMobileClose}
              className="absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full z-10"
              style={{ color: 'var(--ink-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={onMobileClose} />
          </aside>
        </>
      )}
    </>
  );
}

export default Sidebar;
