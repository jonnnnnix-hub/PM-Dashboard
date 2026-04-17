import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type {
  Program,
  Workstream,
  Task,
  WeeklyStatus,
  LaunchChecklist,
  ProgramDocument,
  Meeting,
} from '../types';
import { formatDate, formatCountdown } from '../lib/utils';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  FileText,
  MessageSquare,
  Brain,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  ExternalLink,
  Clock,
  Flag,
  AlertTriangle,
  Sparkles,
  Send,
  Pin,
  Pencil,
  Play,
  Mic,
} from 'lucide-react';
import { Shell } from '../components/ui/Shell';
import { MeetingDetailModal } from '../components/MeetingDetailModal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card, CardHeader } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Chip } from '../components/ui/Chip';
import { RagDot } from '../components/ui/RagDot';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { StatTile } from '../components/ui/StatTile';
import type { AccentName } from '../components/ui/tokens';

type Tab = 'overview' | 'weekly-status' | 'launch-readiness' | 'documents' | 'meetings' | 'brain';

const TYPE_ACCENT: Record<string, AccentName> = {
  migration: 'indigo',
  'price-increase': 'teal',
  'market-rollout': 'rose',
  other: 'sky',
};

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'coral' | 'sky'> = {
  planning: 'neutral',
  'in-flight': 'sky',
  launched: 'success',
  archived: 'neutral',
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProgramData = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();
      if (programData) setProgram(programData);

      const { data: workstreamData } = await supabase
        .from('workstreams')
        .select('*')
        .eq('program_id', id)
        .order('sort_order');
      if (workstreamData) setWorkstreams(workstreamData);

      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('program_id', id)
        .order('created_at', { ascending: false });
      if (taskData) setTasks(taskData);

      const { data: statusData } = await supabase
        .from('weekly_status')
        .select('*')
        .eq('program_id', id)
        .order('week_of', { ascending: false });
      if (statusData) setWeeklyStatuses(statusData);

      const { data: checklistData } = await supabase
        .from('launch_checklists')
        .select('*')
        .eq('program_id', id)
        .single();
      if (checklistData) setChecklist(checklistData);

      const { data: docData } = await supabase
        .from('program_documents')
        .select('*')
        .eq('program_id', id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (docData) setDocuments(docData);

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
      <Shell title="Loading program…" breadcrumbs={[{ label: 'Programs' }]}>
        <div className="grid gap-4">
          <Card padding="lg" className="h-40 animate-pulse-slow" />
          <Card padding="lg" className="h-64 animate-pulse-slow" />
        </div>
      </Shell>
    );
  }

  const accent = TYPE_ACCENT[program.program_type] || 'coral';
  const statusTone = STATUS_TONE[program.status] || 'neutral';

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <FolderOpen size={14} /> },
    { id: 'weekly-status', label: 'Workstreams', icon: <Sparkles size={14} />, count: weeklyStatuses.length },
    { id: 'launch-readiness', label: 'Checklist', icon: <CheckCircle2 size={14} /> },
    { id: 'documents', label: 'Knowledge', icon: <FileText size={14} />, count: documents.length },
    { id: 'meetings', label: 'Meetings', icon: <MessageSquare size={14} />, count: meetings.length },
    { id: 'brain', label: 'Program Brain', icon: <Brain size={14} /> },
  ];

  const countdown = formatCountdown(program.launch_date);
  const daysToLaunch = Math.ceil(
    (new Date(program.launch_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Shell
      title={program.name}
      subtitle={`${program.codename} · ${program.program_type.replace('-', ' ')}`}
      breadcrumbs={[
        { label: 'Programs', href: '/' },
        { label: program.name },
      ]}
      topBarRight={
        <div className="hidden lg:block">
          <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>
            Edit program
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Hero */}
        <Card padding="lg" elevated>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Chip tone={accent} size="sm">
                  {program.program_type.replace('-', ' ')}
                </Chip>
                <Chip tone={statusTone} size="sm">
                  {program.status}
                </Chip>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded tabular"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--ink-tertiary)' }}
                >
                  {program.codename}
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{
                  color: 'var(--ink-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {program.name}
              </h1>
              {program.description && (
                <p className="mt-3 text-base max-w-3xl" style={{ color: 'var(--ink-secondary)' }}>
                  {program.description}
                </p>
              )}

              <div className="mt-5 flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar name={program.owner} size={32} accent={accent} />
                  <div>
                    <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-tertiary)' }}>
                      Owner
                    </div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                      {program.owner}
                    </div>
                  </div>
                </div>
                <div
                  className="w-px self-stretch"
                  style={{ background: 'var(--border)' }}
                />
                <div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-tertiary)' }}>
                    Launch date
                  </div>
                  <div className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--ink-primary)' }}>
                    <Calendar size={14} />
                    {formatDate(program.launch_date)}
                  </div>
                </div>
                <div
                  className="w-px self-stretch"
                  style={{ background: 'var(--border)' }}
                />
                <div>
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-tertiary)' }}>
                    Countdown
                  </div>
                  <div
                    className="text-sm font-semibold font-mono tabular"
                    style={{ color: daysToLaunch < 14 ? 'var(--danger-solid)' : 'var(--ink-primary)' }}
                  >
                    {countdown}
                  </div>
                </div>
              </div>
            </div>

            {/* Right-side big countdown */}
            <div
              className="rounded-2xl p-5 min-w-[180px] text-center"
              style={{
                background: `var(--${accent}-soft)`,
                border: `1px solid var(--${accent}-solid)`,
              }}
            >
              <div
                className="text-5xl font-bold tabular"
                style={{
                  color: `var(--${accent}-ink)`,
                  fontFamily: '"Fraunces", serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {Math.abs(daysToLaunch)}
              </div>
              <div
                className="text-xs uppercase tracking-wider mt-1 font-semibold"
                style={{ color: `var(--${accent}-ink)` }}
              >
                {daysToLaunch >= 0 ? 'days to launch' : 'days since launch'}
              </div>
            </div>
          </div>

          {program.stakeholders?.length > 0 && (
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--ink-tertiary)' }}>
                Stakeholders
              </div>
              <div className="flex flex-wrap gap-2">
                {program.stakeholders.map((s, i) => (
                  <Chip key={i} tone="neutral" size="sm">
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Tabs */}
        <Tabs<Tab> tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <OverviewTab program={program} workstreams={workstreams} tasks={tasks} />
          )}
          {activeTab === 'weekly-status' && <WeeklyStatusTab weeklyStatuses={weeklyStatuses} />}
          {activeTab === 'launch-readiness' && (
            <LaunchReadinessTab program={program} checklist={checklist} />
          )}
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
          {activeTab === 'meetings' && (
            <MeetingsTab meetings={meetings} programId={id!} programName={program.name} />
          )}
          {activeTab === 'brain' && <ProgramBrainTab program={program} />}
        </div>
      </div>
    </Shell>
  );
}

/* ================= Overview ================= */

function OverviewTab({
  program: _program,
  workstreams,
  tasks,
}: {
  program: Program;
  workstreams: Workstream[];
  tasks: Task[];
}) {
  const kanbanColumns: { id: Task['status']; label: string; accent: AccentName }[] = [
    { id: 'todo', label: 'Todo', accent: 'sky' },
    { id: 'in-progress', label: 'In progress', accent: 'coral' },
    { id: 'done', label: 'Done', accent: 'teal' },
    { id: 'blocked', label: 'Blocked', accent: 'rose' },
  ];

  const wsStatusTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    'on-track': 'success',
    'at-risk': 'warning',
    blocked: 'danger',
  };

  const taskCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityColor = (p: Task['priority']): string => {
    switch (p) {
      case 'critical': return 'var(--danger-solid)';
      case 'high': return 'var(--amber-solid)';
      case 'medium': return 'var(--sky-solid)';
      default: return 'var(--border-strong)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Task stat tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kanbanColumns.map(col => (
          <StatTile
            key={col.id}
            label={col.label}
            value={taskCounts[col.id] || 0}
            accent={col.accent}
            icon={<Circle size={16} />}
          />
        ))}
      </div>

      {/* Workstreams */}
      <Card padding="none">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
              Workstreams
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
              {workstreams.length} tracked area{workstreams.length === 1 ? '' : 's'}
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>
            Add workstream
          </Button>
        </div>

        {workstreams.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<FolderOpen size={24} />}
              title="No workstreams yet"
              description="Add workstreams to track different areas of your program."
              accent="coral"
            />
          </div>
        ) : (
          <div>
            {workstreams.map((ws, idx) => (
              <div
                key={ws.id}
                className="px-5 py-4 transition-colors"
                style={{
                  borderBottom: idx === workstreams.length - 1 ? 'none' : '1px solid var(--border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                        {ws.name}
                      </span>
                      <Chip tone={wsStatusTone[ws.status] || 'neutral'} size="xs">
                        {ws.status}
                      </Chip>
                    </div>
                    {ws.notes && (
                      <p className="text-sm mt-1 clamp-2" style={{ color: 'var(--ink-secondary)' }}>
                        {ws.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar name={ws.owner} size={24} />
                    <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                      {ws.owner}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Kanban */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
            Task board
          </div>
          <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>
            Add task
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kanbanColumns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <Card key={col.id} padding="md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: `var(--${col.accent}-solid)` }}
                    />
                    <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                      {col.label}
                    </span>
                  </div>
                  <Chip tone={col.accent} size="xs">
                    {colTasks.length}
                  </Chip>
                </div>
                <div className="space-y-2">
                  {colTasks.length === 0 ? (
                    <div
                      className="text-xs text-center py-5 rounded-lg"
                      style={{
                        background: 'var(--bg-subtle)',
                        color: 'var(--ink-tertiary)',
                      }}
                    >
                      No tasks
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        className="rounded-lg p-3 cursor-pointer transition-all"
                        style={{
                          background: 'var(--bg-canvas)',
                          border: '1px solid var(--border)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--border-strong)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                            {task.title}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                            style={{ background: priorityColor(task.priority) }}
                            title={task.priority}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {task.assignee && (
                            <div className="flex items-center gap-1.5">
                              <Avatar name={task.assignee} size={24} />
                              <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                                {task.assignee}
                              </span>
                            </div>
                          )}
                          {task.due_date && (
                            <span
                              className="text-xs flex items-center gap-1 font-mono tabular"
                              style={{ color: 'var(--ink-tertiary)' }}
                            >
                              <Clock size={10} />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================= Weekly Status ================= */

function WeeklyStatusTab({ weeklyStatuses }: { weeklyStatuses: WeeklyStatus[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
            Status history
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
            {weeklyStatuses.length} update{weeklyStatuses.length === 1 ? '' : 's'}
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setShowNewForm(v => !v)}
        >
          New status
        </Button>
      </div>

      {showNewForm && (
        <Card padding="md">
          <CardHeader
            title="Create weekly status"
            subtitle="AI pre-fill coming soon — will auto-populate from meetings, completed tasks, and bandwidth allocation."
            icon={<Sparkles size={16} />}
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm">
              Create draft
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {weeklyStatuses.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<FileText size={24} />}
              title="No weekly updates yet"
              description="Create your first status update to track progress week over week."
              accent="coral"
            />
          </Card>
        ) : (
          weeklyStatuses.map(status => {
            const expanded = expandedId === status.id;
            return (
              <Card key={status.id} padding="none">
                <button
                  onClick={() => setExpandedId(expanded ? null : status.id)}
                  className="w-full flex items-center justify-between p-4 focus-ring transition-colors text-left"
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-3">
                    <RagDot rag={status.overall_rag} size={10} />
                    <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                      Week of {formatDate(status.week_of)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                      {status.accomplishments.length} wins ·{' '}
                      {status.risks_issues.length} risks ·{' '}
                      {status.blockers.length} blockers
                    </span>
                    {expanded ? (
                      <ChevronDown size={16} style={{ color: 'var(--ink-tertiary)' }} />
                    ) : (
                      <ChevronRight size={16} style={{ color: 'var(--ink-tertiary)' }} />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div
                    className="p-5 space-y-5"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    {status.summary && (
                      <div>
                        <div
                          className="text-xs uppercase tracking-wide mb-1.5 font-semibold"
                          style={{ color: 'var(--ink-tertiary)' }}
                        >
                          Summary
                        </div>
                        <p className="text-sm" style={{ color: 'var(--ink-primary)' }}>
                          {status.summary}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <div
                          className="text-xs uppercase tracking-wide mb-2 font-semibold"
                          style={{ color: 'var(--ink-tertiary)' }}
                        >
                          Accomplishments
                        </div>
                        <ul className="space-y-1.5">
                          {status.accomplishments.map((a, i) => (
                            <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--ink-secondary)' }}>
                              <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--teal-solid)' }} />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div
                          className="text-xs uppercase tracking-wide mb-2 font-semibold"
                          style={{ color: 'var(--ink-tertiary)' }}
                        >
                          Next steps
                        </div>
                        <ul className="space-y-1.5">
                          {status.next_steps.map((n, i) => (
                            <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--ink-secondary)' }}>
                              <Circle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--sky-solid)' }} />
                              <span>{n}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {status.risks_issues.length > 0 && (
                      <div>
                        <div
                          className="text-xs uppercase tracking-wide mb-2 font-semibold flex items-center gap-1"
                          style={{ color: 'var(--amber-ink)' }}
                        >
                          <AlertTriangle size={12} /> Risks &amp; issues
                        </div>
                        <div className="space-y-2">
                          {status.risks_issues.map((r, i) => (
                            <div
                              key={i}
                              className="rounded-lg p-3 text-sm"
                              style={{ background: 'var(--amber-soft)', border: '1px solid var(--amber-solid)' }}
                            >
                              <div style={{ color: 'var(--ink-primary)' }}>{r.description}</div>
                              <div className="text-xs mt-1" style={{ color: 'var(--ink-tertiary)' }}>
                                Severity: {r.severity} · Mitigation: {r.mitigation}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {status.blockers.length > 0 && (
                      <div>
                        <div
                          className="text-xs uppercase tracking-wide mb-2 font-semibold flex items-center gap-1"
                          style={{ color: 'var(--danger-solid)' }}
                        >
                          <AlertCircle size={12} /> Blockers
                        </div>
                        <div className="space-y-2">
                          {status.blockers.map((b, i) => (
                            <div
                              key={i}
                              className="rounded-lg p-3 text-sm"
                              style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger-solid)' }}
                            >
                              <div style={{ color: 'var(--ink-primary)' }}>{b.description}</div>
                              <div className="text-xs mt-1" style={{ color: 'var(--ink-tertiary)' }}>
                                Owner: {b.owner}
                                {b.escalation_needed && ' · Escalation needed'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {status.decisions_needed.length > 0 && (
                      <div>
                        <div
                          className="text-xs uppercase tracking-wide mb-2 font-semibold"
                          style={{ color: 'var(--ink-tertiary)' }}
                        >
                          Decisions needed
                        </div>
                        <ul className="space-y-1.5">
                          {status.decisions_needed.map((d, i) => (
                            <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--ink-secondary)' }}>
                              <Flag size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--indigo-solid)' }} />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ================= Launch Readiness ================= */

function LaunchReadinessTab({
  program,
  checklist,
}: {
  program: Program;
  checklist: LaunchChecklist | null;
}) {
  const [expandedGate, setExpandedGate] = useState<string | null>(null);

  if (!checklist || !checklist.gates) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={<CheckCircle2 size={24} />}
          title="No launch checklist configured"
          description="Clone a template to start tracking launch gates for this program."
          accent="coral"
          action={
            <Button variant="primary" size="md">
              Clone from template
            </Button>
          }
        />
      </Card>
    );
  }

  const currentDate = new Date();
  const launchDate = new Date(program.launch_date);

  const gatesWithDates = checklist.gates.map(gate => ({
    ...gate,
    target_date: new Date(launchDate.getTime() + gate.target_offset_days * 24 * 60 * 60 * 1000),
    is_past:
      new Date(launchDate.getTime() + gate.target_offset_days * 24 * 60 * 60 * 1000) < currentDate,
    required_items: gate.items.filter(i => i.required),
    completed_required: gate.items.filter(i => i.required && i.status === 'complete').length,
    is_complete:
      gate.items.filter(i => i.required && i.status === 'complete').length ===
      gate.items.filter(i => i.required).length,
  }));

  const currentGateIndex = gatesWithDates.findIndex(g => !g.is_past && !g.is_complete);
  const activeGateIndex = currentGateIndex >= 0 ? currentGateIndex : gatesWithDates.length - 1;

  const itemStatusTone: Record<string, 'success' | 'danger' | 'neutral' | 'warning'> = {
    complete: 'success',
    blocked: 'danger',
    na: 'neutral',
    pending: 'warning',
  };

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title="Launch gate timeline"
          subtitle="Track progress through each required gate"
          icon={<Flag size={16} />}
        />
        <div className="relative py-4">
          <div
            className="absolute top-8 left-4 right-4 h-0.5"
            style={{ background: 'var(--border)' }}
          />
          <div className="relative flex justify-between gap-2">
            {gatesWithDates.map((gate, index) => {
              const isActive = index === activeGateIndex;
              const isComplete = gate.is_complete;
              const isOverdue = gate.is_past && !isComplete;

              let bg = 'var(--bg-surface)';
              let border = 'var(--border-strong)';
              let color = 'var(--ink-tertiary)';
              if (isComplete) {
                bg = 'var(--teal-soft)';
                border = 'var(--teal-solid)';
                color = 'var(--teal-ink)';
              } else if (isOverdue) {
                bg = 'var(--danger-soft)';
                border = 'var(--danger-solid)';
                color = 'var(--danger-solid)';
              } else if (isActive) {
                bg = 'var(--coral-soft)';
                border = 'var(--coral-solid)';
                color = 'var(--coral-ink)';
              }

              return (
                <button
                  key={gate.id}
                  onClick={() => setExpandedGate(expandedGate === gate.id ? null : gate.id)}
                  className="flex flex-col items-center group focus-ring rounded-lg px-2"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: bg,
                      border: `2px solid ${border}`,
                      color,
                    }}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={18} />
                    ) : isOverdue ? (
                      <AlertCircle size={18} />
                    ) : (
                      <span className="text-xs font-mono tabular font-semibold">
                        {gate.target_offset_days}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className="text-xs font-semibold"
                      style={{ color }}
                    >
                      {gate.name}
                    </div>
                    <div className="text-xs mt-0.5 tabular" style={{ color: 'var(--ink-tertiary)' }}>
                      {formatDate(gate.target_date.toISOString())}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {gatesWithDates.map(
        gate =>
          expandedGate === gate.id && (
            <Card key={gate.id} padding="none">
              <div
                className="p-5 flex items-center justify-between gap-4 flex-wrap"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div>
                  <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {gate.name}
                  </div>
                  <div className="text-xs mt-1 flex items-center gap-2" style={{ color: 'var(--ink-tertiary)' }}>
                    Target: {formatDate(gate.target_date.toISOString())}
                    {gate.is_past && !gate.is_complete && (
                      <Chip tone="danger" size="xs" icon={<AlertCircle size={10} />}>
                        Overdue
                      </Chip>
                    )}
                    {gate.is_complete && (
                      <Chip tone="success" size="xs" icon={<CheckCircle2 size={10} />}>
                        Complete
                      </Chip>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-tertiary)' }}>
                    Progress
                  </div>
                  <div className="text-lg font-mono tabular font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {gate.completed_required}/{gate.required_items.length} required
                  </div>
                  <div
                    className="w-32 h-2 rounded-full mt-1 overflow-hidden"
                    style={{ background: 'var(--bg-subtle)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: gate.required_items.length
                          ? `${(gate.completed_required / gate.required_items.length) * 100}%`
                          : '0%',
                        background: gate.is_complete
                          ? 'var(--teal-solid)'
                          : gate.is_past
                          ? 'var(--danger-solid)'
                          : 'var(--coral-solid)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-2">
                  {gate.items.map((item: { id: string; title: string; status?: string; required?: boolean; owner_name?: string; owner_role?: string; notes?: string }) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div className="mt-0.5">
                        <Chip tone={itemStatusTone[item.status || 'pending'] || 'neutral'} size="xs">
                          {item.status || 'pending'}
                        </Chip>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                            {item.title}
                          </span>
                          {item.required && (
                            <span
                              className="text-xs font-bold"
                              style={{ color: 'var(--danger-solid)' }}
                              title="Required"
                            >
                              *
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="text-xs mt-1" style={{ color: 'var(--ink-tertiary)' }}>
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-xs shrink-0" style={{ color: 'var(--ink-tertiary)' }}>
                        {item.owner_name || item.owner_role}
                      </div>
                    </div>
                  ))}
                </div>

                {gate.required_items.length > 0 && !gate.is_complete && (
                  <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                    <Button
                      variant="primary"
                      size="md"
                      disabled={gate.completed_required !== gate.required_items.length}
                      leftIcon={<CheckCircle2 size={14} />}
                    >
                      Mark gate complete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )
      )}
    </div>
  );
}

/* ================= Documents ================= */

function DocumentsTab({ documents }: { documents: ProgramDocument[] }) {
  const pinnedDocs = documents.filter(d => d.pinned);

  const docTypeIcon = (type: ProgramDocument['doc_type']): React.ReactNode => {
    switch (type) {
      case 'deck':
      case 'data':
      case 'design':
      case 'other':
        return <FolderOpen size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const docTypeAccent = (type: ProgramDocument['doc_type']): AccentName => {
    const map: Record<string, AccentName> = {
      runbook: 'coral',
      deck: 'indigo',
      memo: 'amber',
      'comms-template': 'teal',
      legal: 'rose',
      data: 'sky',
      design: 'rose',
      other: 'sky',
    };
    return map[type] || 'sky';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
            Linked documents
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
            {documents.length} total · {pinnedDocs.length} pinned
          </div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
          Add document
        </Button>
      </div>

      {pinnedDocs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin size={14} style={{ color: 'var(--amber-solid)' }} />
            <span
              className="text-xs uppercase tracking-wide font-semibold"
              style={{ color: 'var(--ink-tertiary)' }}
            >
              Pinned
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedDocs.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                icon={docTypeIcon(doc.doc_type)}
                accent={docTypeAccent(doc.doc_type)}
              />
            ))}
          </div>
        </div>
      )}

      <Card padding="none">
        <div
          className="px-5 py-3 text-xs uppercase tracking-wide font-semibold"
          style={{ color: 'var(--ink-tertiary)', borderBottom: '1px solid var(--border)' }}
        >
          All documents
        </div>
        {documents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<FileText size={24} />}
              title="No documents linked yet"
              description="Add your runbook, deck, comms templates, and other key artifacts."
              accent="coral"
            />
          </div>
        ) : (
          <div>
            {documents.map((doc, idx) => {
              const accent = docTypeAccent(doc.doc_type);
              return (
                <div
                  key={doc.id}
                  className="px-5 py-3 transition-colors"
                  style={{
                    borderBottom: idx === documents.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `var(--${accent}-soft)`,
                        color: `var(--${accent}-ink)`,
                      }}
                    >
                      {docTypeIcon(doc.doc_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold inline-flex items-center gap-1.5 focus-ring"
                        style={{ color: 'var(--ink-primary)' }}
                      >
                        {doc.title}
                        <ExternalLink size={12} style={{ color: 'var(--ink-tertiary)' }} />
                        {doc.pinned && <Pin size={12} style={{ color: 'var(--amber-solid)' }} />}
                      </a>
                      {doc.description && (
                        <div className="text-xs mt-0.5 clamp-2" style={{ color: 'var(--ink-tertiary)' }}>
                          {doc.description}
                        </div>
                      )}
                    </div>
                    <Chip tone={accent} size="xs">
                      {doc.doc_type.replace('-', ' ')}
                    </Chip>
                    <div className="text-xs hidden md:block" style={{ color: 'var(--ink-tertiary)' }}>
                      {doc.added_by}
                    </div>
                    <div className="text-xs font-mono tabular hidden md:block" style={{ color: 'var(--ink-tertiary)' }}>
                      {formatDate(doc.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function DocumentCard({
  doc,
  icon,
  accent,
}: {
  doc: ProgramDocument;
  icon: React.ReactNode;
  accent: AccentName;
}) {
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl p-4 transition-all card-hover focus-ring"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `var(--${accent}-soft)`,
            color: `var(--${accent}-ink)`,
          }}
        >
          {icon}
        </div>
        <Pin size={14} style={{ color: 'var(--amber-solid)' }} />
      </div>
      <h4 className="font-semibold mb-1" style={{ color: 'var(--ink-primary)' }}>
        {doc.title}
      </h4>
      {doc.description && (
        <p className="text-sm clamp-2" style={{ color: 'var(--ink-secondary)' }}>
          {doc.description}
        </p>
      )}
    </a>
  );
}

/* ================= Meetings ================= */

function MeetingsTab({
  meetings,
  programId,
  programName,
}: {
  meetings: Meeting[];
  programId: string;
  programName: string;
}) {
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const statusTone: Record<Meeting['status'], 'success' | 'warning' | 'sky' | 'danger' | 'neutral'> = {
    ready: 'success',
    processing: 'sky',
    transcribing: 'warning',
    recording: 'danger',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
            Meeting archive
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
            {meetings.length} recording{meetings.length === 1 ? '' : 's'} · stored permanently
          </div>
        </div>
        <a href={`/meetings?program=${programId}`}>
          <Button variant="primary" size="sm" leftIcon={<Mic size={14} />}>
            Record meeting
          </Button>
        </a>
      </div>

      <Card padding="none">
        {meetings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<MessageSquare size={24} />}
              title="No meetings yet"
              description='Click "Record meeting" to start capturing meeting intelligence.'
              accent="coral"
            />
          </div>
        ) : (
          <div>
            {meetings.map((meeting, idx) => (
              <div
                key={meeting.id}
                className="px-5 py-4 transition-colors cursor-pointer"
                style={{
                  borderBottom: idx === meetings.length - 1 ? 'none' : '1px solid var(--border)',
                }}
                onClick={() => setActiveMeeting(meeting)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveMeeting(meeting);
                  }
                }}
                role="button"
                tabIndex={0}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                        {meeting.title}
                      </span>
                      <Chip tone={statusTone[meeting.status]} size="xs">
                        {meeting.status}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {formatDate(meeting.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {Math.floor(meeting.duration_seconds / 60)} min
                      </span>
                      {meeting.attendees.length > 0 && (
                        <span>
                          {meeting.attendees.slice(0, 3).join(', ')}
                          {meeting.attendees.length > 3 && ` +${meeting.attendees.length - 3}`}
                        </span>
                      )}
                    </div>
                    {meeting.status !== 'ready' && typeof meeting.progress === 'number' && (
                      <div className="mt-2 max-w-md">
                        <ProgressBar
                          value={meeting.progress}
                          label={meeting.processing_stage || 'Processing'}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  {meeting.recording_url && (
                    <a
                      href={meeting.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm font-medium focus-ring transition-colors"
                      style={{
                        background: 'var(--coral-soft)',
                        color: 'var(--coral-ink)',
                      }}
                      title="Play recording"
                    >
                      <Play size={12} /> Play
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <MeetingDetailModal
        meeting={activeMeeting}
        programName={programName}
        onClose={() => setActiveMeeting(null)}
      />
    </div>
  );
}

/* ================= Program Brain ================= */

function ProgramBrainTab({ program }: { program: Program }) {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string; sources?: string[] }[]
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `This is a simulated response about "${program.name}". The Program Brain feature will use RAG over meeting transcripts, status updates, and launch checklist notes to answer your questions with source citations.`,
          sources: ['Simulated source - 4/7 weekly sync'],
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card padding="none" elevated>
        <div
          className="p-5 flex items-start gap-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
          >
            <Brain size={20} />
          </div>
          <div>
            <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
              Program Brain
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
              Ask anything about {program.name}. AI answers grounded in meetings, status updates, and launch notes.
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[480px] overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
              >
                <Sparkles size={28} />
              </div>
              <div className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                Ask a question about this program
              </div>
              <div className="text-sm mt-1 max-w-sm" style={{ color: 'var(--ink-tertiary)' }}>
                Example: &ldquo;What did we decide about the pricing tier?&rdquo;
              </div>
              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {[
                  'Summarize the last 3 meetings',
                  'What are the open blockers?',
                  'Who owns the comms plan?',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full focus-ring transition-colors"
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink-secondary)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--coral-soft)';
                      e.currentTarget.style.color = 'var(--coral-ink)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bg-subtle)';
                      e.currentTarget.style.color = 'var(--ink-secondary)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] rounded-2xl p-4"
                style={
                  msg.role === 'user'
                    ? { background: 'var(--coral-solid)', color: 'white' }
                    : { background: 'var(--bg-subtle)', color: 'var(--ink-primary)', border: '1px solid var(--border)' }
                }
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div
                    className="mt-3 pt-3 text-xs"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <div className="font-semibold mb-1 opacity-80">Sources</div>
                    <ul className="space-y-0.5 opacity-70">
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
              <div
                className="rounded-2xl p-4"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
              >
                <div className="flex gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--ink-tertiary)' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--ink-tertiary)', animationDelay: '0.1s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--ink-tertiary)', animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 flex gap-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about this program…"
            className="flex-1"
            leftIcon={<Sparkles size={14} />}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || isLoading}
            leftIcon={<Send size={14} />}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
