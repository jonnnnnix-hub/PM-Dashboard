import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Program, Workstream, Task, WeeklyStatus, LaunchChecklist, ProgramDocument, Meeting } from '../types';
import { formatDate, formatCountdown } from '../lib/utils';
import { 
  CheckCircle2, Circle, AlertCircle, XCircle, Calendar, FileText, 
  MessageSquare, Brain, FolderOpen, ChevronRight, ChevronDown,
  Plus, ExternalLink, Clock, User, Flag
} from 'lucide-react';

type Tab = 'overview' | 'weekly-status' | 'launch-readiness' | 'documents' | 'meetings' | 'brain';

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [program, setProgram] = useState<Program | null>(null);
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyStatuses, setWeeklyStatuses] = useState<WeeklyStatus[]>([]);
  const [checklist, setChecklist] = useState<LaunchChecklist | null>(null);
  const [documents, setDocuments] = useState<ProgramDocument[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProgramData();
  }, [id]);

  const fetchProgramData = async () => {
    if (!id) return;
    setLoading(true);
    
    try {
      // Fetch program
      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (programData) setProgram(programData);

      // Fetch workstreams
      const { data: workstreamData } = await supabase
        .from('workstreams')
        .select('*')
        .eq('program_id', id)
        .order('sort_order');
      
      if (workstreamData) setWorkstreams(workstreamData);

      // Fetch tasks
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('program_id', id)
        .order('created_at', { ascending: false });
      
      if (taskData) setTasks(taskData);

      // Fetch weekly statuses
      const { data: statusData } = await supabase
        .from('weekly_status')
        .select('*')
        .eq('program_id', id)
        .order('week_of', { ascending: false });
      
      if (statusData) setWeeklyStatuses(statusData);

      // Fetch launch checklist
      const { data: checklistData } = await supabase
        .from('launch_checklists')
        .select('*')
        .eq('program_id', id)
        .single();
      
      if (checklistData) setChecklist(checklistData);

      // Fetch documents
      const { data: docData } = await supabase
        .from('program_documents')
        .select('*')
        .eq('program_id', id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (docData) setDocuments(docData);

      // Fetch meetings
      const { data: meetingData } = await supabase
        .from('meetings')
        .select('*')
        .eq('program_id', id)
        .order('date', { ascending: false });
      
      if (meetingData) setMeetings(meetingData);

    } catch (error) {
      console.error('Error fetching program data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !program) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <FolderOpen size={18} /> },
    { id: 'weekly-status', label: 'Weekly Status', icon: <FileText size={18} /> },
    { id: 'launch-readiness', label: 'Launch Readiness', icon: <CheckCircle2 size={18} /> },
    { id: 'documents', label: 'Documents', icon: <ExternalLink size={18} /> },
    { id: 'meetings', label: 'Meetings', icon: <MessageSquare size={18} /> },
    { id: 'brain', label: 'Program Brain', icon: <Brain size={18} /> },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-white">{program.name}</h1>
              <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 rounded">
                {program.codename}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                program.status === 'in-flight' ? 'bg-blue-900/50 text-blue-400' :
                program.status === 'launched' ? 'bg-emerald-900/50 text-emerald-400' :
                program.status === 'planning' ? 'bg-slate-800 text-slate-400' :
                'bg-slate-800 text-slate-500'
              }`}>
                {program.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <User size={14} /> {program.owner}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Launch: {formatDate(program.launch_date)} ({formatCountdown(program.launch_date)})
              </span>
              <span className="capitalize">{program.program_type.replace('-', ' ')}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Edit Program
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 mb-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <OverviewTab
            program={program}
            workstreams={workstreams}
            tasks={tasks}
          />
        )}
        {activeTab === 'weekly-status' && (
          <WeeklyStatusTab
            weeklyStatuses={weeklyStatuses}
          />
        )}
        {activeTab === 'launch-readiness' && (
          <LaunchReadinessTab
            program={program}
            checklist={checklist}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab
            documents={documents}
          />
        )}
        {activeTab === 'meetings' && (
          <MeetingsTab
            meetings={meetings}
          />
        )}
        {activeTab === 'brain' && (
          <ProgramBrainTab program={program} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ program, workstreams, tasks }: {
  program: Program;
  workstreams: Workstream[];
  tasks: Task[];
}) {
  const kanbanColumns: { id: Task['status']; label: string }[] = [
    { id: 'todo', label: 'Todo' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
    { id: 'blocked', label: 'Blocked' },
  ];

  const workstreamStatusCounts = workstreams.reduce((acc, ws) => {
    acc[ws.status] = (acc[ws.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const taskCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-slate-900/50 rounded p-4 border border-slate-800">
        <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
        <p className="text-slate-200">{program.description || 'No description provided.'}</p>
        {program.stakeholders.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-medium text-slate-500 mb-1">Stakeholders</h4>
            <div className="flex flex-wrap gap-2">
              {program.stakeholders.map((s, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Workstreams */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Workstreams</h3>
          <div className="flex gap-2 text-xs">
            {Object.entries(workstreamStatusCounts).map(([status, count]) => (
              <span key={status} className={`px-2 py-1 rounded ${
                status === 'on-track' ? 'bg-emerald-900/30 text-emerald-400' :
                status === 'at-risk' ? 'bg-amber-900/30 text-amber-400' :
                status === 'blocked' ? 'bg-red-900/30 text-red-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Owner</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {workstreams.map(ws => (
                <tr key={ws.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                  <td className="px-4 py-2 text-slate-200">{ws.name}</td>
                  <td className="px-4 py-2 text-slate-400">{ws.owner}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      ws.status === 'on-track' ? 'bg-emerald-900/50 text-emerald-400' :
                      ws.status === 'at-risk' ? 'bg-amber-900/50 text-amber-400' :
                      ws.status === 'blocked' ? 'bg-red-900/50 text-red-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {ws.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-400 max-w-md truncate">{ws.notes}</td>
                </tr>
              ))}
              {workstreams.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No workstreams yet. Add workstreams to track different areas of your program.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Board */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Task Board</h3>
          <div className="flex gap-2 text-xs">
            {kanbanColumns.map(col => (
              <span key={col.id} className="px-2 py-1 rounded bg-slate-800 text-slate-400">
                {col.label}: {taskCounts[col.id] || 0}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {kanbanColumns.map(col => (
            <div key={col.id} className="bg-slate-900/50 rounded border border-slate-800 p-3">
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                {col.label}
                <span className="px-1.5 py-0.5 text-xs bg-slate-800 rounded">{taskCounts[col.id] || 0}</span>
              </h4>
              <div className="space-y-2">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div
                    key={task.id}
                    className="bg-slate-800/50 rounded p-3 border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm text-slate-200 font-medium">{task.title}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        task.priority === 'critical' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-slate-500'
                      }`} />
                    </div>
                    {task.assignee && (
                      <div className="text-xs text-slate-500 mt-1">{task.assignee}</div>
                    )}
                    {task.due_date && (
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={10} /> {formatDate(task.due_date)}
                      </div>
                    )}
                  </div>
                ))}
                {(!tasks.filter(t => t.status === col.id).length) && (
                  <div className="text-xs text-slate-600 text-center py-4">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Weekly Status Tab Component
function WeeklyStatusTab({ weeklyStatuses }: {
  weeklyStatuses: WeeklyStatus[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Status History</h3>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Plus size={16} /> New Status Update
        </button>
      </div>

      {showNewForm && (
        <div className="bg-slate-900/50 rounded border border-slate-800 p-4">
          <h4 className="text-sm font-medium text-white mb-3">Create Weekly Status</h4>
          <p className="text-sm text-slate-400 mb-4">
            AI pre-fill coming soon - will auto-populate from this week's meetings, completed tasks, and bandwidth allocation.
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
              Cancel
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
              Create Draft
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {weeklyStatuses.map(status => (
          <div
            key={status.id}
            className="bg-slate-900/50 rounded border border-slate-800 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === status.id ? null : status.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${
                  status.overall_rag === 'green' ? 'bg-emerald-500' :
                  status.overall_rag === 'yellow' ? 'bg-amber-500' :
                  'bg-red-500'
                }`} />
                <span className="text-sm font-medium text-white">
                  Week of {formatDate(status.week_of)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {status.accomplishments.length} accomplishments · {status.risks_issues.length} risks · {status.blockers.length} blockers
                </span>
                {expandedId === status.id ? (
                  <ChevronDown size={16} className="text-slate-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400" />
                )}
              </div>
            </button>
            
            {expandedId === status.id && (
              <div className="border-t border-slate-800 p-4 space-y-4">
                <div>
                  <h5 className="text-xs font-medium text-slate-500 mb-1">Summary</h5>
                  <p className="text-sm text-slate-300">{status.summary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-slate-500 mb-2">Accomplishments</h5>
                    <ul className="space-y-1">
                      {status.accomplishments.map((a, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-slate-500 mb-2">Next Steps</h5>
                    <ul className="space-y-1">
                      {status.next_steps.map((n, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <Circle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {status.risks_issues.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-amber-500 mb-2 flex items-center gap-1">
                      <AlertCircle size={12} /> Risks & Issues
                    </h5>
                    <div className="space-y-2">
                      {status.risks_issues.map((r, i) => (
                        <div key={i} className="text-sm bg-amber-900/20 border border-amber-900/50 rounded p-2">
                          <div className="text-slate-300">{r.description}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Severity: {r.severity} · Mitigation: {r.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status.blockers.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-red-500 mb-2 flex items-center gap-1">
                      <XCircle size={12} /> Blockers
                    </h5>
                    <div className="space-y-2">
                      {status.blockers.map((b, i) => (
                        <div key={i} className="text-sm bg-red-900/20 border border-red-900/50 rounded p-2">
                          <div className="text-slate-300">{b.description}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Owner: {b.owner} {b.escalation_needed && '· ⚠️ Escalation needed'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status.decisions_needed.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-slate-500 mb-2">Decisions Needed</h5>
                    <ul className="space-y-1">
                      {status.decisions_needed.map((d, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <Flag size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {weeklyStatuses.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No weekly status updates yet. Create your first status update to track progress.
          </div>
        )}
      </div>
    </div>
  );
}

// Launch Readiness Tab Component
function LaunchReadinessTab({ program, checklist }: {
  program: Program;
  checklist: LaunchChecklist | null;
}) {
  const [expandedGate, setExpandedGate] = useState<string | null>(null);

  if (!checklist || !checklist.gates) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">No launch checklist configured for this program.</div>
        <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
          Clone from Template
        </button>
      </div>
    );
  }

  const currentDate = new Date();
  const launchDate = new Date(program.launch_date);
  
  const gatesWithDates = checklist.gates.map(gate => ({
    ...gate,
    target_date: new Date(launchDate.getTime() + gate.target_offset_days * 24 * 60 * 60 * 1000),
    is_past: new Date(launchDate.getTime() + gate.target_offset_days * 24 * 60 * 60 * 1000) < currentDate,
    required_items: gate.items.filter(i => i.required),
    completed_required: gate.items.filter(i => i.required && i.status === 'complete').length,
    is_complete: gate.items.filter(i => i.required && i.status === 'complete').length === gate.items.filter(i => i.required).length,
  }));

  const currentGateIndex = gatesWithDates.findIndex(g => !g.is_past && !g.is_complete);
  const activeGateIndex = currentGateIndex >= 0 ? currentGateIndex : gatesWithDates.length - 1;

  return (
    <div className="space-y-6">
      {/* Gate Timeline */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Launch Gate Timeline</h3>
        <div className="relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-800" />
          <div className="relative flex justify-between">
            {gatesWithDates.map((gate, index) => {
              const isActive = index === activeGateIndex;
              const isComplete = gate.is_complete;
              const isOverdue = gate.is_past && !isComplete;

              return (
                <button
                  key={gate.id}
                  onClick={() => setExpandedGate(expandedGate === gate.id ? null : gate.id)}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isComplete ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' :
                    isOverdue ? 'bg-red-900/50 border-red-500 text-red-400' :
                    isActive ? 'bg-blue-900/50 border-blue-500 text-blue-400' :
                    'bg-slate-900 border-slate-700 text-slate-500'
                  }`}>
                    {isComplete ? <CheckCircle2 size={16} /> : 
                     isOverdue ? <AlertCircle size={16} /> :
                     <span className="text-xs font-mono">{gate.target_offset_days}</span>}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${
                      isActive ? 'text-blue-400' :
                      isComplete ? 'text-emerald-400' :
                      isOverdue ? 'text-red-400' :
                      'text-slate-500'
                    }`}>
                      {gate.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      {formatDate(gate.target_date.toISOString())}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Gate Details */}
      {gatesWithDates.map((gate) => (
        expandedGate === gate.id && (
          <div key={gate.id} className="bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-white">{gate.name}</h4>
                <div className="text-sm text-slate-400 mt-1">
                  Target: {formatDate(gate.target_date.toISOString())} · 
                  {gate.is_past && !gate.is_complete && <span className="text-red-400 ml-2">⚠️ Overdue</span>}
                  {gate.is_complete && <span className="text-emerald-400 ml-2">✓ Complete</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Progress</div>
                <div className="text-lg font-mono text-white">
                  {gate.completed_required}/{gate.required_items.length} required
                </div>
                <div className="w-32 h-2 bg-slate-800 rounded mt-1">
                  <div 
                    className={`h-full rounded ${
                      gate.is_complete ? 'bg-emerald-500' :
                      gate.is_past && !gate.is_complete ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${(gate.completed_required / gate.required_items.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <table className="w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Item</th>
                    <th className="text-left py-2">Owner</th>
                    <th className="text-left py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {gate.items.map(item => (
                    <tr key={item.id} className="border-t border-slate-800">
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          item.status === 'complete' ? 'bg-emerald-900/50 text-emerald-400' :
                          item.status === 'blocked' ? 'bg-red-900/50 text-red-400' :
                          item.status === 'na' ? 'bg-slate-800 text-slate-500' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {item.status || 'pending'}
                        </span>
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </td>
                      <td className="py-3 text-slate-200">{item.title}</td>
                      <td className="py-3 text-slate-400">{item.owner_name || item.owner_role}</td>
                      <td className="py-3 text-slate-500 max-w-xs truncate">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {gate.required_items.length > 0 && !gate.is_complete && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <button
                    disabled={gate.completed_required !== gate.required_items.length}
                    className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded transition-colors"
                  >
                    Mark Gate Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// Documents Tab Component
function DocumentsTab({ documents }: {
  documents: ProgramDocument[];
}) {
  const pinnedDocs = documents.filter(d => d.pinned);

  const docTypeIcons: Record<ProgramDocument['doc_type'], React.ReactNode> = {
    'runbook': <FileText size={16} />,
    'deck': <FolderOpen size={16} />,
    'memo': <FileText size={16} />,
    'comms-template': <FileText size={16} />,
    'legal': <FileText size={16} />,
    'data': <FolderOpen size={16} />,
    'design': <FolderOpen size={16} />,
    'other': <FolderOpen size={16} />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Linked Documents</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
          <Plus size={16} /> Add Document
        </button>
      </div>

      {pinnedDocs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Flag size={14} /> Pinned Documents
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {pinnedDocs.map(doc => (
              <DocumentCard key={doc.id} doc={doc} icon={docTypeIcons[doc.doc_type]} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-3">All Documents</h4>
        <div className="bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Type</th>
                <th className="text-left px-4 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Description</th>
                <th className="text-left px-4 py-2 font-medium">Added By</th>
                <th className="text-left px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-400">
                    <span className="flex items-center gap-2">
                      {docTypeIcons[doc.doc_type]}
                      <span className="capitalize text-xs">{doc.doc_type.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-2">
                      {doc.title}
                      <ExternalLink size={12} />
                    </a>
                    {doc.pinned && <span className="text-amber-500 ml-2">📌</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-md truncate">{doc.description}</td>
                  <td className="px-4 py-3 text-slate-400">{doc.added_by}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(doc.created_at)}</td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No documents linked yet. Add your runbook, deck, comms templates, and other key artifacts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DocumentCard({ doc, icon }: { doc: ProgramDocument; icon: React.ReactNode }) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-slate-900/50 rounded border border-slate-800 p-4 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-slate-400">{icon}</span>
        <span className="text-amber-500">📌</span>
      </div>
      <h4 className="text-sm font-medium text-white mb-1">{doc.title}</h4>
      <p className="text-xs text-slate-500">{doc.description}</p>
    </a>
  );
}

// Meetings Tab Component
function MeetingsTab({ meetings }: {
  meetings: Meeting[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Meeting History</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
          <Plus size={16} /> Record Meeting
        </button>
      </div>

      <div className="bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Title</th>
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Duration</th>
              <th className="text-left px-4 py-2 font-medium">Attendees</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting.id} className="border-t border-slate-800 hover:bg-slate-800/30 cursor-pointer">
                <td className="px-4 py-3 text-slate-200 font-medium">{meeting.title}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(meeting.date)}</td>
                <td className="px-4 py-3 text-slate-400">
                  {Math.floor(meeting.duration_seconds / 60)} min
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                  {meeting.attendees.slice(0, 3).join(', ')}
                  {meeting.attendees.length > 3 && ` +${meeting.attendees.length - 3}`}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    meeting.status === 'ready' ? 'bg-emerald-900/50 text-emerald-400' :
                    meeting.status === 'processing' ? 'bg-blue-900/50 text-blue-400' :
                    meeting.status === 'transcribing' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {meeting.status}
                  </span>
                </td>
              </tr>
            ))}
            {meetings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No meetings recorded yet. Click "Record Meeting" to start capturing meeting intelligence.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Program Brain Tab Component
function ProgramBrainTab({ program }: { program: Program }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: string[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulated response - will be replaced with actual RAG query
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `This is a simulated response about "${program.name}". The Program Brain feature will use RAG over meeting transcripts, status updates, and launch checklist notes to answer your questions with source citations.`,
        sources: ['Simulated source - 4/7 weekly sync']
      }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-1">Program Brain</h3>
        <p className="text-sm text-slate-400">
          Ask anything about {program.name}. AI-powered answers from meeting transcripts, status updates, and launch notes.
        </p>
      </div>

      <div className="bg-slate-900/50 rounded border border-slate-800 overflow-hidden">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>Ask a question about this program...</p>
              <p className="text-xs mt-2">Example: "What did we decide about the pricing tier?"</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Sources:</p>
                    <ul className="text-xs text-slate-500 space-y-0.5">
                      {msg.sources.map((source, j) => (
                        <li key={j}>• {source}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this program..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded text-sm transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
