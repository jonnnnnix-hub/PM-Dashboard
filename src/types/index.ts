export type ProgramType = 'migration' | 'price-increase' | 'market-rollout' | 'other';
export type ProgramStatus = 'planning' | 'in-flight' | 'launched' | 'closed';
export type WorkstreamStatus = 'on-track' | 'at-risk' | 'blocked' | 'complete';
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type RAGStatus = 'green' | 'yellow' | 'red';
export type ChecklistItemStatus = 'pending' | 'complete' | 'blocked' | 'na';
export type DocType = 'runbook' | 'deck' | 'memo' | 'comms-template' | 'legal' | 'data' | 'design' | 'other';
export type MeetingStatus = 'recording' | 'transcribing' | 'processing' | 'ready';
export type KnowledgeSourceType = 'transcript' | 'summary' | 'status_update' | 'decision' | 'checklist_note' | 'manual_note';

export interface Program {
  id: string;
  name: string;
  codename: string;
  program_type: ProgramType;
  status: ProgramStatus;
  launch_date: string;
  owner: string;
  stakeholders: string[];
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Workstream {
  id: string;
  program_id: string;
  name: string;
  owner: string;
  status: WorkstreamStatus;
  notes: string;
  sort_order: number;
}

export interface Task {
  id: string;
  workstream_id: string;
  program_id: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  source_meeting_id: string | null;
  created_at: string;
}

export interface RiskIssue {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
}

export interface Blocker {
  description: string;
  owner: string;
  escalation_needed: boolean;
}

export interface WeeklyStatus {
  id: string;
  program_id: string;
  week_of: string;
  overall_rag: RAGStatus;
  summary: string;
  accomplishments: string[];
  next_steps: string[];
  risks_issues: RiskIssue[];
  blockers: Blocker[];
  decisions_needed: string[];
  notes: string;
  created_at: string;
}

export interface BandwidthAllocation {
  id: string;
  week_of: string;
  program_id: string;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface BandwidthNote {
  id: string;
  week_of: string;
  focus_notes: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  owner_role: string;
  owner_name?: string;
  required: boolean;
  status?: ChecklistItemStatus;
  completed_at?: string;
  notes?: string;
}

export interface Gate {
  id: string;
  name: string;
  target_offset_days: number;
  items: ChecklistItem[];
  signed_off_at?: string;
}

export interface LaunchChecklistTemplate {
  id: string;
  program_type: ProgramType;
  name: string;
  gates: Gate[];
  created_at: string;
}

export interface LaunchChecklist {
  id: string;
  program_id: string;
  template_id: string | null;
  gates: Gate[];
  created_at: string;
  updated_at: string;
}

export interface ProgramDocument {
  id: string;
  program_id: string;
  title: string;
  url: string;
  doc_type: DocType;
  description: string;
  pinned: boolean;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  item: string;
  owner: string;
  due_date: string | null;
}

export interface Decision {
  decision: string;
  context: string;
  made_by: string | null;
}

export interface Meeting {
  id: string;
  program_id: string;
  title: string;
  date: string;
  attendees: string[];
  duration_seconds: number;
  recording_url: string;
  transcript: string;
  summary: string;
  key_points: string[];
  action_items: ActionItem[];
  decisions: Decision[];
  embedding_ids: string[];
  status: MeetingStatus;
  created_at: string;
}

export interface WeeklyDigest {
  id: string;
  week_of: string;
  digest_markdown: string;
  generated_at: string;
  source_data: {
    meeting_count: number;
    status_count: number;
    tasks_completed: number;
    tasks_created: number;
    programs_active: number;
  };
  created_at: string;
}

export interface ProgramKnowledge {
  id: string;
  program_id: string;
  meeting_id: string | null;
  content: string;
  embedding: number[];
  source_type: KnowledgeSourceType;
  metadata: Record<string, unknown>;
  created_at: string;
}

// UI-specific types
export interface ProgramCardData extends Program {
  latest_rag?: RAGStatus;
  latest_summary?: string;
  workstream_completion?: number;
  gate_progress?: { current_gate: string; completed: number; total: number };
  unreviewed_meetings?: number;
  overdue_gate?: boolean;
}

export interface BrainMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}
