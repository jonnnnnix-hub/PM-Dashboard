import type { ReactNode } from 'react';
import { cn } from './tokens';

interface Tab<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, active, onChange, className }: TabsProps<T>) {
  return (
    <div
      className={cn('flex items-center gap-1 overflow-x-auto', className)}
      style={{ borderBottom: '1px solid var(--border)' }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className="inline-flex items-center gap-2 px-3 h-11 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-[3px]"
            style={{
              color: isActive ? 'var(--accent)' : 'var(--ink-secondary)',
              borderBottomColor: isActive ? 'var(--accent)' : 'transparent',
              // @ts-ignore
              '--tw-ring-color': 'var(--accent-ring)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--ink-primary)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--ink-secondary)';
            }}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full tabular"
                style={{
                  background: isActive ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                  color: isActive ? 'var(--accent-on-soft)' : 'var(--ink-tertiary)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
