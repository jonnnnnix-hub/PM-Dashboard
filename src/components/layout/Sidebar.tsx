import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  Mic,
  Brain,
  FileText,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bandwidth', icon: Gauge, label: 'Bandwidth' },
  { to: '/meetings', icon: Mic, label: 'Meetings' },
  { to: '/digest', icon: FileText, label: 'Digest' },
  { to: '/brain', icon: Brain, label: 'Brain' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-700 bg-slate-850 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <FolderKanban size={22} className="text-blue-400" />
          <span className="font-semibold text-slate-100 tracking-tight">PM Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors',
                isActive
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 mono">v0.1.0 — Phase 1</p>
      </div>
    </aside>
  );
}
