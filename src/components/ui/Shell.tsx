import { useState, type ReactNode } from 'react';
import { PanelRightOpen, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface ShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  topBarRight?: ReactNode;
  rightRail?: ReactNode;
  rightRailTitle?: string;
  children: ReactNode;
}

export function Shell({
  title,
  subtitle,
  breadcrumbs,
  topBarRight,
  rightRail,
  rightRailTitle = 'Today',
  children,
}: ShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-canvas)' }}>
      <Sidebar mobileOpen={navOpen} onMobileClose={() => setNavOpen(false)} />

      <div className="md:pl-[240px]">
        <div className={rightRail ? 'xl:pr-[320px]' : ''}>
          <TopBar
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            rightSlot={
              <>
                {topBarRight}
                {rightRail && (
                  <button
                    type="button"
                    aria-label="Open side panel"
                    onClick={() => setRailOpen(true)}
                    className="xl:hidden w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors flex-shrink-0"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--ink-secondary)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  >
                    <PanelRightOpen size={16} />
                  </button>
                )}
              </>
            }
            onOpenMobileNav={() => setNavOpen(true)}
          />
          <main className="px-4 md:px-6 lg:px-8 py-5 md:py-6 lg:py-8">
            <div className="max-w-[1440px] mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {/* Right rail — desktop (xl+) */}
      {rightRail && (
        <aside
          className="hidden xl:flex fixed inset-y-0 right-0 w-[320px] flex-col z-20"
          style={{
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <div className="flex-1 overflow-y-auto p-6">{rightRail}</div>
        </aside>
      )}

      {/* Right rail — mobile/tablet drawer */}
      {rightRail && railOpen && (
        <>
          <div
            className="xl:hidden fixed inset-0 z-40 animate-fadein"
            style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={() => setRailOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="xl:hidden fixed inset-y-0 right-0 w-[340px] max-w-[92vw] flex flex-col z-50"
            style={{
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border)',
              animation: 'lpmo-slidein-right 220ms cubic-bezier(0.32, 0.72, 0, 1) both',
            }}
          >
            <div
              className="h-14 flex items-center justify-between px-5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--ink-primary)' }}
              >
                {rightRailTitle}
              </div>
              <button
                type="button"
                aria-label="Close side panel"
                onClick={() => setRailOpen(false)}
                className="w-9 h-9 inline-flex items-center justify-center rounded-full"
                style={{ color: 'var(--ink-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{rightRail}</div>
          </aside>
        </>
      )}
    </div>
  );
}

export default Shell;
