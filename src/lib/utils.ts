import { type TaskPriority, type TaskStatus, type WorkstreamStatus, type RAGStatus, type ProgramType, type DocType } from '../types';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'critical': return 'text-red-400 bg-red-500/10';
    case 'high': return 'text-orange-400 bg-orange-500/10';
    case 'medium': return 'text-amber-400 bg-amber-500/10';
    case 'low': return 'text-slate-400 bg-slate-500/10';
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'done': return 'text-emerald-400 bg-emerald-500/10';
    case 'in-progress': return 'text-blue-400 bg-blue-500/10';
    case 'blocked': return 'text-red-400 bg-red-500/10';
    case 'todo': return 'text-slate-400 bg-slate-500/10';
  }
}

export function getWorkstreamStatusColor(status: WorkstreamStatus): string {
  switch (status) {
    case 'on-track': return 'text-emerald-400 bg-emerald-500/10';
    case 'at-risk': return 'text-amber-400 bg-amber-500/10';
    case 'blocked': return 'text-red-400 bg-red-500/10';
    case 'complete': return 'text-slate-400 bg-slate-500/10';
  }
}

export function getRAGColor(rag: RAGStatus): string {
  switch (rag) {
    case 'green': return 'text-emerald-400 bg-emerald-500/10';
    case 'yellow': return 'text-amber-400 bg-amber-500/10';
    case 'red': return 'text-red-400 bg-red-500/10';
  }
}

export function getProgramTypeColor(type: ProgramType): string {
  switch (type) {
    case 'migration': return 'text-blue-400 bg-blue-500/10';
    case 'price-increase': return 'text-emerald-400 bg-emerald-500/10';
    case 'market-rollout': return 'text-purple-400 bg-purple-500/10';
    case 'other': return 'text-slate-400 bg-slate-500/10';
  }
}

export function getDocTypeIcon(docType: DocType): string {
  switch (docType) {
    case 'runbook': return '📖';
    case 'deck': return '📊';
    case 'memo': return '📝';
    case 'comms-template': return '📧';
    case 'legal': return '⚖️';
    case 'data': return '📈';
    case 'design': return '🎨';
    case 'other': return '📄';
  }
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  });
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatCountdown(targetDate: string): string {
  const target = new Date(targetDate);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) return 'Launch day';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `T-${days} days`;
}
