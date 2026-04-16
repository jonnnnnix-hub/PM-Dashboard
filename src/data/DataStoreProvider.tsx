import { useState, useCallback, type ReactNode } from 'react';
import { DataStoreContext, type DataStore } from './store';
import { MOCK_PROGRAMS, MOCK_WORKSTREAMS, MOCK_TASKS, MOCK_WEEKLY_STATUSES } from './mock';
import { generateId } from '@/lib/utils';
import type { Program, Workstream, Task } from '@/types';

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>(MOCK_PROGRAMS);
  const [workstreams, setWorkstreams] = useState<Workstream[]>(MOCK_WORKSTREAMS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [weeklyStatuses] = useState(MOCK_WEEKLY_STATUSES);

  const addProgram = useCallback((p: Omit<Program, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const program: Program = { ...p, id: generateId(), created_at: now, updated_at: now };
    setPrograms(prev => [...prev, program]);
    return program;
  }, []);

  const updateProgram = useCallback((id: string, updates: Partial<Program>) => {
    setPrograms(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
  }, []);

  const deleteProgram = useCallback((id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
    setWorkstreams(prev => prev.filter(w => w.program_id !== id));
    setTasks(prev => prev.filter(t => t.program_id !== id));
  }, []);

  const addWorkstream = useCallback((w: Omit<Workstream, 'id'>) => {
    const ws: Workstream = { ...w, id: generateId() };
    setWorkstreams(prev => [...prev, ws]);
    return ws;
  }, []);

  const updateWorkstream = useCallback((id: string, updates: Partial<Workstream>) => {
    setWorkstreams(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const deleteWorkstream = useCallback((id: string) => {
    setWorkstreams(prev => prev.filter(w => w.id !== id));
    setTasks(prev => prev.map(t => t.workstream_id === id ? { ...t, workstream_id: null as unknown as string } : t));
  }, []);

  const addTask = useCallback((t: Omit<Task, 'id' | 'created_at'>) => {
    const task: Task = { ...t, id: generateId(), created_at: new Date().toISOString() };
    setTasks(prev => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates };
      if (updates.status === 'done' && !t.completed_at) {
        updated.completed_at = new Date().toISOString();
      }
      if (updates.status && updates.status !== 'done') {
        updated.completed_at = null;
      }
      return updated;
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const store: DataStore = {
    programs, addProgram, updateProgram, deleteProgram,
    workstreams, addWorkstream, updateWorkstream, deleteWorkstream,
    tasks, addTask, updateTask, deleteTask,
    weeklyStatuses,
  };

  return (
    <DataStoreContext.Provider value={store}>
      {children}
    </DataStoreContext.Provider>
  );
}
