import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface ShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  topBarRight?: ReactNode;
  rightRail?: ReactNode;
  children: ReactNode;
}

export function Shell({
  title,
  subtitle,
  breadcrumbs,
  topBarRight,
  rightRail,
  children,
}: ShellProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-canvas)' }}>
      <Sidebar />
      <div className="md:pl-[240px]">
        <div className={rightRail ? 'xl:pr-[320px]' : ''}>
          <TopBar
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            rightSlot={topBarRight}
          />
          <main className="px-6 lg:px-8 py-6 lg:py-8">
            <div className="max-w-[1440px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
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
    </div>
  );
}

export default Shell;
