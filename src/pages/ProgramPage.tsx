import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useDataStore } from '@/data/store';
import { OverviewTab } from '@/components/programs/OverviewTab';
import { WorkstreamTable } from '@/components/programs/WorkstreamTable';
import { TaskBoard } from '@/components/programs/TaskBoard';
import { ProgramForm } from '@/components/programs/ProgramForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn, programTypeLabel } from '@/lib/utils';
import type { Program } from '@/types';

const TABS = ['Overview', 'Workstreams', 'Tasks', 'Status', 'Checklist', 'Documents'] as const;
type Tab = typeof TABS[number];

export function ProgramPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { programs, workstreams, tasks, weeklyStatuses, updateProgram, deleteProgram } = useDataStore();

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const program = programs.find(p => p.id === id);

  const programWorkstreams = useMemo(
    () => workstreams.filter(w => w.program_id === id),
    [workstreams, id]
  );

  const programTasks = useMemo(
    () => tasks.filter(t => t.program_id === id),
    [tasks, id]
  );

  const latestStatus = useMemo(() => {
    const statuses = weeklyStatuses.filter(s => s.program_id === id);
    if (statuses.length === 0) return undefined;
    return statuses.sort((a, b) => b.week_of.localeCompare(a.week_of))[0];
  }, [weeklyStatuses, id]);

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-medium text-slate-300 mb-2">Program not found</h2>
        <Link to="/" className="text-sm text-blue-400 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const handleUpdate = (data: Omit<Program, 'id' | 'created_at' | 'updated_at'>) => {
    updateProgram(program.id, data);
  };

  const handleDelete = () => {
    deleteProgram(program.id);
    navigate('/');
  };

  const statusColors: Record<string, string> = {
    planning: 'badge-slate',
    'in-flight': 'badge-blue',
    launched: 'badge-green',
    closed: 'badge-yellow',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-3 transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="mono text-xs text-slate-500">{program.codename}</span>
              <span className={statusColors[program.status]}>{program.status}</span>
              <span className="text-xs text-slate-600">{programTypeLabel(program.program_type)}</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100">{program.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEdit(true)} className="btn-ghost flex items-center gap-1 text-sm">
              <Pencil size={14} /> Edit
            </button>
            <button onClick={() => setShowDelete(true)} className="btn-ghost text-red-400 flex items-center gap-1 text-sm">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 flex gap-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(activeTab === tab ? 'tab-active' : 'tab')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <OverviewTab
          program={program}
          latestStatus={latestStatus}
          workstreams={programWorkstreams}
          tasks={programTasks}
        />
      )}
      {activeTab === 'Workstreams' && (
        <WorkstreamTable programId={program.id} workstreams={programWorkstreams} />
      )}
      {activeTab === 'Tasks' && (
        <TaskBoard programId={program.id} tasks={programTasks} workstreams={programWorkstreams} />
      )}
      {activeTab === 'Status' && (
        <div className="card py-12 text-center text-slate-500 text-sm">
          Weekly status form coming in Phase 2.
        </div>
      )}
      {activeTab === 'Checklist' && (
        <div className="card py-12 text-center text-slate-500 text-sm">
          Launch checklist coming in Phase 3.
        </div>
      )}
      {activeTab === 'Documents' && (
        <div className="card py-12 text-center text-slate-500 text-sm">
          Document hub coming in Phase 4.
        </div>
      )}

      <ProgramForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleUpdate}
        initial={program}
      />

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Program"
        message={`Are you sure you want to delete "${program.name}"? This will also delete all workstreams and tasks. This action cannot be undone.`}
      />
    </div>
  );
}
