import { useState, useMemo } from 'react';
import { Plus, Filter, LayoutGrid } from 'lucide-react';
import { useDataStore } from '@/data/store';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { ProgramForm } from '@/components/programs/ProgramForm';
import type { Program, ProgramStatus } from '@/types';

const STATUS_FILTERS: { value: ProgramStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'planning', label: 'Planning' },
  { value: 'in-flight', label: 'In Flight' },
  { value: 'launched', label: 'Launched' },
  { value: 'closed', label: 'Closed' },
];

export function Dashboard() {
  const { programs, tasks, weeklyStatuses, addProgram } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | 'all'>('all');

  const filteredPrograms = useMemo(() => {
    if (statusFilter === 'all') return programs;
    return programs.filter(p => p.status === statusFilter);
  }, [programs, statusFilter]);

  const getLatestStatus = (programId: string) => {
    const statuses = weeklyStatuses.filter(s => s.program_id === programId);
    if (statuses.length === 0) return undefined;
    return statuses.sort((a, b) => b.week_of.localeCompare(a.week_of))[0];
  };

  const getTaskCounts = (programId: string) => {
    const programTasks = tasks.filter(t => t.program_id === programId);
    return {
      todo: programTasks.filter(t => t.status === 'todo').length,
      inProgress: programTasks.filter(t => t.status === 'in-progress').length,
      done: programTasks.filter(t => t.status === 'done').length,
      blocked: programTasks.filter(t => t.status === 'blocked').length,
    };
  };

  const handleCreateProgram = (data: Omit<Program, 'id' | 'created_at' | 'updated_at'>) => {
    addProgram(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Programs</h2>
          <p className="text-sm text-slate-500 mt-1">{programs.length} program{programs.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Program
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm">
          <Filter size={14} className="text-slate-500" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={statusFilter === f.value ? 'tab-active' : 'tab'}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Program Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPrograms.map(program => {
            const latest = getLatestStatus(program.id);
            return (
              <ProgramCard
                key={program.id}
                program={program}
                latestRag={latest?.overall_rag}
                latestSummary={latest?.summary}
                taskCounts={getTaskCounts(program.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <LayoutGrid size={40} className="text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No programs found</h3>
          <p className="text-sm text-slate-500 mb-4">
            {statusFilter !== 'all'
              ? `No programs with status "${statusFilter}". Try a different filter.`
              : 'Get started by creating your first program.'}
          </p>
          {statusFilter === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Program
            </button>
          )}
        </div>
      )}

      <ProgramForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleCreateProgram}
      />
    </div>
  );
}
