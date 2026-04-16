import { createContext, useContext } from 'react';
import type { Program, Workstream, Task, WeeklyStatus } from '@/types';

export interface DataStore {
  // Programs
  programs: Program[];
  addProgram: (p: Omit<Program, 'id' | 'created_at' | 'updated_at'>) => Program;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  // Workstreams
  workstreams: Workstream[];
  addWorkstream: (w: Omit<Workstream, 'id'>) => Workstream;
  updateWorkstream: (id: string, updates: Partial<Workstream>) => void;
  deleteWorkstream: (id: string) => void;
  // Tasks
  tasks: Task[];
  addTask: (t: Omit<Task, 'id' | 'created_at'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Weekly Status
  weeklyStatuses: WeeklyStatus[];
}

export const DataStoreContext = createContext<DataStore | null>(null);

export function useDataStore(): DataStore {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider');
  return ctx;
}
