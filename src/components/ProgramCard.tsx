import { Calendar, AlertTriangle, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Program, RAGStatus } from '../types';

interface ProgramCardProps {
  program: Program & {
    latest_rag?: RAGStatus;
    latest_summary?: string;
    gate_progress?: { current_gate: string; completed: number; total: number };
    unreviewed_meetings?: number;
    overdue_gate?: boolean;
  };
}

function getRAGColor(rag: RAGStatus | undefined): string {
  switch (rag) {
    case 'green': return 'bg-emerald-400';
    case 'yellow': return 'bg-amber-400';
    case 'red': return 'bg-red-400';
    default: return 'bg-slate-400';
  }
}

function getDaysUntilLaunch(launchDate: string): number {
  const launch = new Date(launchDate);
  const now = new Date();
  const diff = launch.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function ProgramCard({ program }: ProgramCardProps) {
  const daysUntilLaunch = getDaysUntilLaunch(program.launch_date);
  const isOverdue = daysUntilLaunch < 0 && program.status === 'in-flight';

  return (
    <Link to={`/program/${program.id}`} className="block group">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${getRAGColor(program.latest_rag)}`} />
              <h3 className="text-sm font-semibold text-white truncate">{program.name}</h3>
            </div>
            <p className="text-xs text-slate-400 font-mono">{program.codename}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            program.program_type === 'migration' ? 'bg-blue-500/20 text-blue-400' :
            program.program_type === 'price-increase' ? 'bg-emerald-500/20 text-emerald-400' :
            program.program_type === 'market-rollout' ? 'bg-purple-500/20 text-purple-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {program.program_type.replace('-', ' ')}
          </span>
        </div>

        {/* Launch Info */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span className={isOverdue ? 'text-red-400' : ''}>
              {daysUntilLaunch > 0 ? `T-${daysUntilLaunch} days` : 
               daysUntilLaunch === 0 ? 'Launch Day' : 
               `Launched ${Math.abs(daysUntilLaunch)}d ago`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>{program.owner}</span>
          </div>
        </div>

        {/* Gate Progress */}
        {program.gate_progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">{program.gate_progress.current_gate}</span>
              <span className="text-slate-400">{program.gate_progress.completed}/{program.gate_progress.total}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  program.overdue_gate ? 'bg-red-400' : 'bg-blue-500'
                }`}
                style={{ width: `${(program.gate_progress.completed / program.gate_progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Latest Summary */}
        {program.latest_summary && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{program.latest_summary}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {program.unreviewed_meetings ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3 h-3" />
                {program.unreviewed_meetings} pending
              </span>
            ) : null}
            {program.overdue_gate && (
              <span className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
          <span className="text-xs text-blue-400 group-hover:text-blue-300">View →</span>
        </div>
      </div>
    </Link>
  );
}
