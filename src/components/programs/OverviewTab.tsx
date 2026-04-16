import { Calendar, User, Users, Tag, Clock, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import type { Program, WeeklyStatus, Workstream, Task } from '@/types';
import { formatDate, launchCountdown, programTypeLabel, ragBadgeClass, workstreamStatusColor, cn } from '@/lib/utils';

interface OverviewTabProps {
  program: Program;
  latestStatus?: WeeklyStatus;
  workstreams: Workstream[];
  tasks: Task[];
}

export function OverviewTab({ program, latestStatus, workstreams, tasks }: OverviewTabProps) {
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const activeWorkstreams = workstreams.filter(w => w.status !== 'complete').length;

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="label mb-2">Launch</div>
          <div className="text-lg font-semibold text-slate-100">{launchCountdown(program.launch_date)}</div>
          <div className="text-xs text-slate-500 mt-1">{formatDate(program.launch_date)}</div>
        </div>
        <div className="card">
          <div className="label mb-2">Tasks</div>
          <div className="text-lg font-semibold text-slate-100">{doneTasks}/{totalTasks}</div>
          <div className="text-xs text-slate-500 mt-1">
            {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}% complete
          </div>
        </div>
        <div className="card">
          <div className="label mb-2">Workstreams</div>
          <div className="text-lg font-semibold text-slate-100">{activeWorkstreams}</div>
          <div className="text-xs text-slate-500 mt-1">{workstreams.length} total</div>
        </div>
        <div className="card">
          <div className="label mb-2">Health</div>
          <div className="text-lg font-semibold">
            {latestStatus ? (
              <span className={ragBadgeClass(latestStatus.overall_rag)}>
                {latestStatus.overall_rag.toUpperCase()}
              </span>
            ) : (
              <span className="text-slate-500">No status</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {latestStatus ? `Week of ${formatDate(latestStatus.week_of, 'MMM d')}` : 'Submit first status'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Program Details */}
        <div className="col-span-1 space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Owner</dt>
                  <dd className="text-slate-200">{program.owner}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Launch Date</dt>
                  <dd className="text-slate-200">{formatDate(program.launch_date)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Type</dt>
                  <dd className="text-slate-200">{programTypeLabel(program.program_type)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Stakeholders</dt>
                  <dd className="text-slate-200">{program.stakeholders.join(', ') || 'None'}</dd>
                </div>
              </div>
              {program.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <Tag size={14} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-slate-500 text-xs">Tags</dt>
                    <dd className="flex flex-wrap gap-1 mt-0.5">
                      {program.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5">{tag}</span>
                      ))}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {program.description && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">Description</h3>
              <p className="text-sm text-slate-400">{program.description}</p>
            </div>
          )}
        </div>

        {/* Latest Status */}
        <div className="col-span-2 space-y-4">
          {latestStatus ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">Latest Status</h3>
                  <span className="text-xs text-slate-500">{formatDate(latestStatus.week_of, 'MMM d, yyyy')}</span>
                </div>
                <p className="text-sm text-slate-300 mb-4">{latestStatus.summary}</p>

                {latestStatus.accomplishments.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 mb-1">
                      <CheckCircle2 size={12} /> Accomplishments
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1 ml-4">
                      {latestStatus.accomplishments.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}

                {latestStatus.next_steps.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-blue-400 mb-1">
                      <Clock size={12} /> Next Steps
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1 ml-4">
                      {latestStatus.next_steps.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}

                {latestStatus.blockers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-red-400 mb-1">
                      <AlertTriangle size={12} /> Blockers
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1 ml-4">
                      {latestStatus.blockers.map((b, i) => (
                        <li key={i}>
                          {b.description} <span className="text-slate-500">— {b.owner}</span>
                          {b.escalation_needed && <span className="badge-red ml-1 text-[10px]">ESCALATE</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-slate-500">No weekly status yet.</p>
              <p className="text-xs text-slate-600 mt-1">Status updates will appear here once submitted.</p>
            </div>
          )}

          {/* Workstream Summary */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Workstreams</h3>
            {workstreams.length > 0 ? (
              <div className="space-y-2">
                {workstreams.map(ws => (
                  <div key={ws.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(workstreamStatusColor(ws.status))}>{ws.status}</span>
                      <span className="text-slate-200">{ws.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{ws.owner}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No workstreams yet. Add them in the Workstreams tab.</p>
            )}
          </div>

          {/* Blocked tasks */}
          {blockedTasks > 0 && (
            <div className="card border-red-500/30">
              <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle size={14} /> {blockedTasks} Blocked Task{blockedTasks > 1 ? 's' : ''}
              </h3>
              <div className="space-y-1">
                {tasks.filter(t => t.status === 'blocked').map(t => (
                  <div key={t.id} className="text-sm text-slate-400">
                    {t.title} <span className="text-slate-500">— {t.assignee || 'Unassigned'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
