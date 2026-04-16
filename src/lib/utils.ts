import { format, differenceInDays, startOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';
import type { RAGStatus, WorkstreamStatus, TaskStatus, ChecklistItemStatus, ProgramType, DocType, TaskPriority } from '@/types';

export function formatDate(date: string | Date, fmt: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function getMonday(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getMondayString(date: Date = new Date()): string {
  return format(getMonday(date), 'yyyy-MM-dd');
}

export function getWeekRange(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  return `${format(monday, 'MMM d')} – ${format(friday, 'MMM d, yyyy')}`;
}

export function nextWeek(monday: Date): Date {
  return addWeeks(monday, 1);
}

export function prevWeek(monday: Date): Date {
  return subWeeks(monday, 1);
}

export function daysUntilLaunch(launchDate: string): number {
  return differenceInDays(parseISO(launchDate), new Date());
}

export function launchCountdown(launchDate: string): string {
  const days = daysUntilLaunch(launchDate);
  if (days === 0) return 'LAUNCH DAY';
  if (days > 0) return `T-${days} days`;
  return `T+${Math.abs(days)} days`;
}

export function ragColor(rag: RAGStatus): string {
  switch (rag) {
    case 'green': return 'text-emerald-400';
    case 'yellow': return 'text-amber-400';
    case 'red': return 'text-red-400';
  }
}

export function ragBg(rag: RAGStatus): string {
  switch (rag) {
    case 'green': return 'bg-emerald-400';
    case 'yellow': return 'bg-amber-400';
    case 'red': return 'bg-red-400';
  }
}

export function ragBadgeClass(rag: RAGStatus): string {
  switch (rag) {
    case 'green': return 'badge-green';
    case 'yellow': return 'badge-yellow';
    case 'red': return 'badge-red';
  }
}

export function workstreamStatusColor(status: WorkstreamStatus): string {
  switch (status) {
    case 'on-track': return 'badge-green';
    case 'at-risk': return 'badge-yellow';
    case 'blocked': return 'badge-red';
    case 'complete': return 'badge-blue';
  }
}

export function taskStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'todo': return 'badge-slate';
    case 'in-progress': return 'badge-blue';
    case 'done': return 'badge-green';
    case 'blocked': return 'badge-red';
  }
}

export function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'low': return 'text-slate-400';
    case 'medium': return 'text-blue-400';
    case 'high': return 'text-amber-400';
    case 'critical': return 'text-red-400';
  }
}

export function checklistItemStatusColor(status: ChecklistItemStatus): string {
  switch (status) {
    case 'pending': return 'badge-slate';
    case 'complete': return 'badge-green';
    case 'blocked': return 'badge-red';
    case 'na': return 'badge-slate';
  }
}

export function programTypeLabel(type: ProgramType): string {
  switch (type) {
    case 'migration': return 'Migration';
    case 'price-increase': return 'Price Increase';
    case 'market-rollout': return 'Market Rollout';
    case 'other': return 'Other';
  }
}

export function docTypeIcon(type: DocType): string {
  switch (type) {
    case 'runbook': return 'book-open';
    case 'deck': return 'presentation';
    case 'memo': return 'file-text';
    case 'comms-template': return 'mail';
    case 'legal': return 'scale';
    case 'data': return 'database';
    case 'design': return 'palette';
    case 'other': return 'file';
  }
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Program colors for bandwidth charts
const PROGRAM_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#6366f1', // indigo-500
];

export function getProgramColor(index: number): string {
  return PROGRAM_COLORS[index % PROGRAM_COLORS.length];
}
