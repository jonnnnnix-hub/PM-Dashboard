import { useState } from 'react';
import { Plus, MoreVertical, Calendar, User, Flag } from 'lucide-react';
import type { Task, TaskStatus, Workstream } from '@/types';
import { useDataStore } from '@/data/store';
import { TaskForm } from './TaskForm';
import { priorityColor, formatDate, cn } from '@/lib/utils';

interface TaskBoardProps {
  programId: string;
  tasks: Task[];
  workstreams: Workstream[];
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'Todo', color: 'border-slate-500' },
  { status: 'in-progress', label: 'In Progress', color: 'border-blue-500' },
  { status: 'done', label: 'Done', color: 'border-emerald-500' },
  { status: 'blocked', label: 'Blocked', color: 'border-red-500' },
];

export function TaskBoard({ programId, tasks, workstreams }: TaskBoardProps) {
  const { addTask, updateTask, deleteTask } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleNewTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
    setMenuTaskId(null);
  };

  const handleSaveTask = (data: Omit<Task, 'id' | 'created_at'>) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (newStatus: TaskStatus) => {
    if (draggedTaskId) {
      updateTask(draggedTaskId, { status: newStatus });
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Task Board</h3>
        <button onClick={() => handleNewTask('todo')} className="btn-ghost text-blue-400 flex items-center gap-1 text-xs">
          <Plus size={14} /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.status);
          return (
            <div
              key={col.status}
              className="flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}
            >
              <div className={cn('border-t-2 mb-3 pt-3', col.color)}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-xs text-slate-500 mono">{columnTasks.length}</span>
                </div>
              </div>

              <div className="space-y-2 flex-1 min-h-[200px]">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={cn(
                      'card p-3 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-colors group',
                      draggedTaskId === task.id && 'opacity-50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-slate-200 flex-1">{task.title}</h4>
                      <div className="relative">
                        <button
                          onClick={() => setMenuTaskId(menuTaskId === task.id ? null : task.id)}
                          className="text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {menuTaskId === task.id && (
                          <div className="absolute right-0 top-6 bg-slate-700 border border-slate-600 shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="block w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { deleteTask(task.id); setMenuTaskId(null); }}
                              className="block w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-slate-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className={cn('flex items-center gap-1', priorityColor(task.priority))}>
                        <Flag size={10} />
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(task.due_date, 'MMM d')}
                        </span>
                      )}
                      {task.assignee && (
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          {task.assignee.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleNewTask(col.status)}
                  className="w-full py-2 text-xs text-slate-600 hover:text-slate-400 hover:bg-slate-800/50 border border-dashed border-slate-700 transition-colors"
                >
                  + Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TaskForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        onSave={handleSaveTask}
        programId={programId}
        workstreams={workstreams}
        initial={editingTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
