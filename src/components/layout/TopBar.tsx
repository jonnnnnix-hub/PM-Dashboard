import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/bandwidth': 'Bandwidth Tracker',
  '/meetings': 'Meetings',
  '/digest': 'Weekly Digest',
  '/brain': 'Program Brain',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

function getTitle(pathname: string): string {
  if (pathname.includes('/exec-slide')) return 'Exec Slide';
  if (pathname.startsWith('/programs/')) return 'Program Detail';
  return ROUTE_TITLES[pathname] || 'PM Dashboard';
}

export function TopBar() {
  const { pathname } = useLocation();

  return (
    <header className="h-14 shrink-0 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
        {getTitle(pathname)}
      </h1>

      <div className="flex items-center gap-2">
        <button className="btn-ghost flex items-center gap-2 text-slate-400" title="Search (coming soon)">
          <Search size={16} />
          <span className="text-xs hidden sm:inline">Search</span>
        </button>
        <button className="btn-ghost relative" title="Notifications (coming soon)">
          <Bell size={16} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white ml-2">
          PM
        </div>
      </div>
    </header>
  );
}
