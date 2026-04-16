import { Calendar, BarChart3, FileText, Brain, Settings, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Calendar },
  { name: 'Bandwidth', href: '/bandwidth', icon: BarChart3 },
  { name: 'Weekly 1:1s', href: '/weekly', icon: FileText },
  { name: 'Meetings', href: '/meetings', icon: Brain },
  { name: 'Digest', href: '/digest', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-lg font-semibold text-white tracking-tight">LPMO Command Center</h1>
        <p className="text-xs text-slate-400 mt-1">Program Management Office</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <button className="hover:text-slate-300">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
