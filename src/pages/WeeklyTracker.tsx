import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/utils';
import { ChevronLeft, ChevronRight, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { WeeklyStatus } from '../types';

export default function WeeklyTracker() {
  const { programs, currentWeek, setCurrentWeek, getWeekStart } = useApp();
  const [weeklyStatuses] = useState<Record<string, WeeklyStatus>>({});

  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(next);
  };

  const statusList = Object.values(weeklyStatuses);
  const submittedCount = statusList.filter(s => s.overall_rag).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Weekly 1:1 Tracker</h1>
        <p className="text-slate-400">Cross-program weekly reporting for manager 1:1s</p>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-slate-800 rounded transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <div className="text-center">
            <div className="text-lg font-medium text-white">
              {formatDate(weekStart.toISOString())} - {formatDate(weekEnd.toISOString())}
            </div>
            {weekStart.getTime() === getWeekStart(new Date()).getTime() && (
              <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded">Current Week</span>
            )}
          </div>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-slate-800 rounded transition-colors"
          >
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-slate-400">Status Progress</div>
            <div className="text-lg font-mono text-white">
              {submittedCount}/{programs.length} submitted
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
            Generate 1:1 Brief
          </button>
        </div>
      </div>

      {/* Bandwidth Summary Section */}
      <div className="bg-slate-900/50 rounded border border-slate-800 p-4 mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Bandwidth Summary (This Week)</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-8 bg-slate-800 rounded overflow-hidden flex">
            {programs.slice(0, 5).map((program, i) => (
              <div
                key={program.id}
                className="h-full bg-blue-500"
                style={{ width: `${100 / programs.length}%`, opacity: 1 - (i * 0.15) }}
              />
            ))}
          </div>
          <div className="text-sm text-slate-400">
            Total: <span className="text-white font-mono">~{programs.length * 20}%</span>
          </div>
        </div>
      </div>

      {/* Program Status Table */}
      <div className="bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Program</th>
              <th className="text-left px-4 py-3 font-medium">RAG</th>
              <th className="text-left px-4 py-3 font-medium">Summary</th>
              <th className="text-left px-4 py-3 font-medium">Launch Readiness</th>
              <th className="text-left px-4 py-3 font-medium">Risks</th>
              <th className="text-left px-4 py-3 font-medium">Blockers</th>
              <th className="text-left px-4 py-3 font-medium">Decisions</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(program => {
              const status = weeklyStatuses[program.id];
              return (
                <tr key={program.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{program.name}</div>
                    <div className="text-xs text-slate-500">{program.codename}</div>
                  </td>
                  <td className="px-4 py-3">
                    {status ? (
                      <span className={`w-3 h-3 rounded-full inline-block ${
                        status.overall_rag === 'green' ? 'bg-emerald-500' :
                        status.overall_rag === 'yellow' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`} />
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-300">
                    {status?.summary || <span className="text-slate-600">No summary</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    T-14 gate: 6/8 ✓
                  </td>
                  <td className="px-4 py-3">
                    {status?.risks_issues.length ? (
                      <span className="px-2 py-0.5 text-xs bg-amber-900/30 text-amber-400 rounded">
                        {status.risks_issues.length}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {status?.blockers.length ? (
                      <span className="px-2 py-0.5 text-xs bg-red-900/30 text-red-400 rounded">
                        {status.blockers.length}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {status?.decisions_needed.length ? (
                      <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded">
                        {status.decisions_needed.length}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {status ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle2 size={12} /> Submitted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertCircle size={12} /> Missing
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Brief Preview */}
      <div className="mt-6 bg-slate-900/50 rounded border border-slate-800 p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <FileText size={16} /> 1:1 Brief Preview
        </h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p>The AI-generated brief will include:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Bandwidth allocation summary with focus context</li>
            <li>Portfolio-level RAG summary</li>
            <li>Program-by-program highlights with launch readiness snapshots</li>
            <li>Aggregated risks and escalations</li>
            <li>Recommended discussion topics for your manager 1:1</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
