import { Link } from 'react-router-dom';
import { Calendar, Users, Tag } from 'lucide-react';
import type { Program, RAGStatus } from '@/types';
import { programTypeLabel, launchCountdown, ragBadgeClass, cn } from '@/lib/utils';

interface ProgramCardProps {
  program: Program;
  latestRag?: RAGStatus;
  latestSummary?: string;
  taskCounts?: { todo: number; inProgress: number; done: number; blocked: number };
}

export function ProgramCard({ program, latestRag, latestSummary, taskCounts }: ProgramCardProps) {
  const statusColors: Record<string, string> = {
    planning: 'badge-slate',
    'in-flight': 'badge-blue',
    launched: 'badge-green',
    closed: 'badge-yellow',
  };

  return (
    <Link to={`/programs/${program.id}`} className="card-hover block group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="mono text-xs text-slate-500">{program.codename}</span>
            <span className={statusColors[program.status]}>{program.status}</span>
          </div>
          <h3 className="text-base font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
            {program.name}
          </h3>
        </div>
        {latestRag && (
          <span className={cn(ragBadgeClass(latestRag), 'ml-3 shrink-0')}>
            {latestRag.toUpperCase()}
          </span>
        )}
      </div>

      {latestSummary && (
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{latestSummary}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {launchCountdown(program.launch_date)}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {program.owner}
        </span>
      </div>

      {taskCounts && (
        <div className="flex gap-2 text-xs mb-3">
          {taskCounts.done > 0 && <span className="badge-green">{taskCounts.done} done</span>}
          {taskCounts.inProgress > 0 && <span className="badge-blue">{taskCounts.inProgress} active</span>}
          {taskCounts.todo > 0 && <span className="badge-slate">{taskCounts.todo} todo</span>}
          {taskCounts.blocked > 0 && <span className="badge-red">{taskCounts.blocked} blocked</span>}
        </div>
      )}

      {program.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <Tag size={11} className="text-slate-600" />
          {program.tags.map(tag => (
            <span key={tag} className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>{programTypeLabel(program.program_type)}</span>
        <span className="group-hover:text-blue-400 transition-colors">View details &rarr;</span>
      </div>
    </Link>
  );
}
