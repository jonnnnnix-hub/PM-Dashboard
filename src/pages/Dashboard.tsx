import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Activity, FileText, CheckCircle2, Mic, Calendar, Clock,
  Sparkles, ArrowUpRight, MessageSquare, FileUp,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ProgramCard } from '../components/ProgramCard';
import { NewProgramModal } from '../components/NewProgramModal';
import { IngestPRDModal } from '../components/IngestPRDModal';
import {
  Shell, Card, CardHeader, Button, Chip, EmptyState, StatTile, Avatar,
} from '../components/ui';
import type { Program } from '../types';

interface DashboardProgram extends Program {
  latest_rag?: 'green' | 'yellow' | 'red';
  latest_summary?: string;
  gate_progress?: { current_gate: string; completed: number; total: number };
  unreviewed_meetings?: number;
  overdue_gate?: boolean;
}

function ProgramStatusGauge({ onTrack, total }: { onTrack: number; total: number }) {
  const pct = total > 0 ? Math.round((onTrack / total) * 100) : 0;
  const data = [
    { name: 'on', value: pct },
    { name: 'rest', value: 100 - pct },
  ];
  return (
    <Card padding="md" className="flex flex-col h-full">
      <CardHeader
        title="Program health"
        subtitle="Share of programs on track"
        action={<Chip tone="success" size="sm">{onTrack} of {total} on track</Chip>}
      />
      <div className="flex-1 relative flex items-center justify-center" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={75}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
              cornerRadius={10}
              stroke="none"
              paddingAngle={data[0].value > 0 && data[1].value > 0 ? 2 : 0}
            >
              <Cell fill="var(--teal)" />
              <Cell fill="var(--bg-subtle)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-[44px] font-bold tabular leading-none"
            style={{ color: 'var(--ink-primary)', letterSpacing: '-0.03em' }}
          >
            {pct}<span className="text-[20px] font-semibold" style={{ color: 'var(--ink-tertiary)' }}>%</span>
          </div>
          <div className="label-micro mt-2">portfolio health</div>
        </div>
      </div>
    </Card>
  );
}

function WeeklyActivity({ data }: { data: { week: string; updates: number }[] }) {
  return (
    <Card padding="md" className="flex flex-col h-full">
      <CardHeader
        title="Weekly activity"
        subtitle="Status updates submitted over the last 8 weeks"
        action={<Chip tone="coral" size="sm">+12% MoM</Chip>}
      />
      <div className="flex-1" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="dashCoralFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
            <Tooltip
              cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
              contentStyle={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-md)',
                color: 'var(--ink-primary)',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="updates"
              stroke="var(--coral)"
              strokeWidth={3}
              strokeLinecap="round"
              fill="url(#dashCoralFill)"
              activeDot={{ r: 6, fill: 'var(--coral)', strokeWidth: 3, stroke: 'var(--bg-surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={points}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const { programs, loading, refreshPrograms } = useApp();
  const [dashboardPrograms, setDashboardPrograms] = useState<DashboardProgram[]>([]);
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [showIngest, setShowIngest] = useState(false);
  const [stats, setStats] = useState({
    activePrograms: 0,
    pendingStatuses: 0,
    openActions: 0,
    recentMeetings: 0,
  });
  const [activityData, setActivityData] = useState<{ week: string; updates: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ title: string; subtitle: string; time: string }[]>([]);

  const fetchDashboardData = async () => {
    if (!programs.length) {
      setActivityData(buildEmptyActivity());
      return;
    }

    const programIds = programs.map((p) => p.id);

    const { data: statuses } = await supabase
      .from('weekly_status')
      .select('*')
      .in('program_id', programIds);

    const { data: meetings } = await supabase
      .from('meetings')
      .select('*')
      .in('program_id', programIds)
      .eq('status', 'ready');

    const { data: checklists } = await supabase
      .from('launch_checklists')
      .select('*')
      .in('program_id', programIds);

    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const enriched = programs.map((program) => {
      const programStatuses = (statuses || []).filter((s) => s.program_id === program.id);
      const latestStatus = programStatuses.sort(
        (a, b) => new Date(b.week_of).getTime() - new Date(a.week_of).getTime()
      )[0];
      const programMeetings = (meetings || []).filter((m) => m.program_id === program.id);

      const checklist = (checklists || []).find((c) => c.program_id === program.id);
      let gateProgress: { current_gate: string; completed: number; total: number } | undefined;
      let overdueGate = false;

      if (checklist && checklist.gates) {
        const now = new Date();
        const launchDate = new Date(program.launch_date);
        const gatesWithDates = checklist.gates.map((gate: { id: string; name: string; target_offset_days: number; items: { status?: string; required: boolean }[] }) => ({
          ...gate,
          targetDate: new Date(launchDate.getTime() + gate.target_offset_days * 24 * 60 * 60 * 1000),
        }));
        const currentGate =
          gatesWithDates.find((g: { targetDate: Date }) => g.targetDate >= now) || gatesWithDates[gatesWithDates.length - 1];

        if (currentGate) {
          const completed = currentGate.items.filter((i: { status?: string }) => i.status === 'complete').length;
          const total = currentGate.items.filter((i: { required: boolean }) => i.required).length;
          gateProgress = { current_gate: currentGate.name, completed, total };
          const targetDate = new Date(
            launchDate.getTime() + currentGate.target_offset_days * 24 * 60 * 60 * 1000
          );
          if (targetDate < now && completed < total) overdueGate = true;
        }
      }

      return {
        ...program,
        latest_rag: latestStatus?.overall_rag,
        latest_summary: latestStatus?.summary,
        gate_progress: gateProgress,
        unreviewed_meetings: programMeetings.length,
        overdue_gate: overdueGate,
      };
    });

    setDashboardPrograms(enriched);

    // Build 8-week activity series
    const series: { week: string; updates: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(weekStart);
      start.setDate(start.getDate() - i * 7);
      const startISO = start.toISOString().split('T')[0];
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const endISO = end.toISOString().split('T')[0];
      const count = (statuses || []).filter(
        (s) => s.week_of >= startISO && s.week_of < endISO
      ).length;
      series.push({
        week: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        updates: count,
      });
    }
    setActivityData(series);

    // Recent activity
    const allEvents: { title: string; subtitle: string; time: string; ts: number }[] = [];
    (statuses || []).slice(0, 10).forEach((s) => {
      const program = programs.find((p) => p.id === s.program_id);
      if (program) {
        allEvents.push({
          title: `Status update — ${program.name}`,
          subtitle: s.summary?.slice(0, 80) || 'Weekly status submitted',
          time: timeAgo(s.created_at),
          ts: new Date(s.created_at).getTime(),
        });
      }
    });
    (meetings || []).slice(0, 10).forEach((m) => {
      const program = programs.find((p) => p.id === m.program_id);
      if (program) {
        allEvents.push({
          title: `${m.title}`,
          subtitle: `Meeting ready · ${program.name}`,
          time: timeAgo(m.created_at),
          ts: new Date(m.created_at).getTime(),
        });
      }
    });
    setRecentActivity(allEvents.sort((a, b) => b.ts - a.ts).slice(0, 6));

    // Stats
    const currentWeekStr = weekStart.toISOString().split('T')[0];
    const pendingStatusCount = programs.filter((p) => {
      const hasStatusThisWeek = (statuses || []).some(
        (s) => s.program_id === p.id && s.week_of?.startsWith(currentWeekStr.substring(0, 10))
      );
      return !hasStatusThisWeek && p.status !== 'closed';
    }).length;

    setStats({
      activePrograms: programs.filter((p) => p.status === 'in-flight' || p.status === 'planning').length,
      pendingStatuses: pendingStatusCount,
      openActions: 0,
      recentMeetings: meetings?.length || 0,
    });
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs]);

  const onTrackCount = useMemo(
    () => dashboardPrograms.filter((p) => p.latest_rag === 'green' && p.status !== 'closed').length,
    [dashboardPrograms]
  );
  const totalActive = useMemo(
    () => dashboardPrograms.filter((p) => p.status !== 'closed').length,
    [dashboardPrograms]
  );

  const today = new Date();
  const greeting = useMemo(() => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, [today]);

  // Mini sparkline data
  const sparkSeries = useMemo(() => activityData.map((d) => d.updates), [activityData]);
  const trendingDown = sparkSeries.length > 1 && sparkSeries[sparkSeries.length - 1] < sparkSeries[sparkSeries.length - 2];

  const rightRail = (
    <RightRailContent
      todayItems={dashboardPrograms.slice(0, 4).map((p) => ({
        id: p.id,
        name: p.name,
        codename: p.codename,
        rag: p.latest_rag,
      }))}
      activity={recentActivity}
    />
  );

  if (loading && !programs.length) {
    return (
      <Shell title="Dashboard" subtitle="Loading your portfolio…">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card padding="lg" className="h-[280px] animate-pulse-slow" />
          <Card padding="lg" className="h-[280px] animate-pulse-slow" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} padding="md" className="h-[112px] animate-pulse-slow" />
          ))}
        </div>
      </Shell>
    );
  }

  const activePrograms = dashboardPrograms.filter((p) => p.status !== 'closed');
  const closedPrograms = dashboardPrograms.filter((p) => p.status === 'closed');

  return (
    <Shell
      title={`${greeting}, Alex`}
      subtitle={today.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })}
      topBarRight={
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Mobile + tablet: icon-only */}
          <button
            type="button"
            onClick={() => setShowIngest(true)}
            aria-label="Ingest PRD"
            className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              color: 'var(--ink-secondary)',
            }}
          >
            <FileUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowNewProgram(true)}
            aria-label="New program"
            className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: '1px solid var(--accent)',
            }}
          >
            <Plus size={16} />
          </button>

          {/* Desktop: full buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="secondary"
              leftIcon={<FileUp size={16} />}
              onClick={() => setShowIngest(true)}
            >
              Ingest PRD
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setShowNewProgram(true)}
            >
              New program
            </Button>
          </div>
        </div>
      }
      rightRail={rightRail}
    >
      {/* Hero row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProgramStatusGauge onTrack={onTrackCount} total={totalActive} />
        <WeeklyActivity data={activityData} />
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile
          label="Active"
          value={stats.activePrograms}
          accent="coral"
          icon={<Activity size={18} />}
          spark={<Sparkline data={sparkSeries.length ? sparkSeries : [3, 4, 3, 5, 4, 6, 5, 7]} color="var(--coral)" />}
        />
        <StatTile
          label="Pending"
          value={stats.pendingStatuses}
          accent="amber"
          icon={<FileText size={18} />}
          hint={stats.pendingStatuses === 0 ? 'All caught up' : 'due this week'}
        />
        <StatTile
          label="Action Items"
          value={stats.openActions}
          accent="teal"
          icon={<CheckCircle2 size={18} />}
          spark={<Sparkline data={[2, 4, 3, 5, 4, 6, 5, 4]} color="var(--teal)" />}
        />
        <StatTile
          label="Meetings"
          value={stats.recentMeetings}
          accent="indigo"
          icon={<Mic size={18} />}
          delta={trendingDown ? -8 : 14}
        />
      </div>

      {/* Programs */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}>
              Active programs
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
              {activePrograms.length} in flight or planning
            </p>
          </div>
          <a
            href="#"
            className="text-[13px] font-medium inline-flex items-center gap-1 hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View portfolio <ArrowUpRight size={14} />
          </a>
        </div>

        {activePrograms.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<Sparkles size={22} />}
              title="No programs yet"
              description="Create your first program to start tracking bandwidth, weekly status, and launch readiness."
              accent="coral"
              action={
                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setShowNewProgram(true)}
                >
                  Create your first program
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activePrograms.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </section>

      {/* Closed */}
      {closedPrograms.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-[18px] font-semibold" style={{ color: 'var(--ink-primary)', letterSpacing: '-0.01em' }}>
              Closed programs
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
              {closedPrograms.length} archived
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {closedPrograms.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      )}

      <NewProgramModal
        isOpen={showNewProgram}
        onClose={() => setShowNewProgram(false)}
        onSuccess={() => refreshPrograms()}
      />
      <IngestPRDModal
        isOpen={showIngest}
        onClose={() => setShowIngest(false)}
        onSuccess={() => refreshPrograms()}
      />
    </Shell>
  );
}

function RightRailContent({
  todayItems,
  activity,
}: {
  todayItems: { id: string; name: string; codename: string; rag?: 'green' | 'yellow' | 'red' }[];
  activity: { title: string; subtitle: string; time: string }[];
}) {
  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-micro">Today's agenda</h3>
          <Calendar size={14} style={{ color: 'var(--ink-tertiary)' }} />
        </div>
        {todayItems.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-tertiary)' }}>
            Nothing scheduled. Enjoy the focused time.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {todayItems.map((item, i) => (
              <li
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-[color:var(--bg-subtle)]"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] tabular font-semibold"
                  style={{
                    background: 'var(--bg-subtle)',
                    color: 'var(--ink-secondary)',
                  }}
                >
                  {`${9 + i}:00`}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: 'var(--ink-primary)' }}>
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono" style={{ color: 'var(--ink-tertiary)' }}>
                    {item.codename}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-micro">Recent activity</h3>
          <MessageSquare size={14} style={{ color: 'var(--ink-tertiary)' }} />
        </div>
        {activity.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-tertiary)' }}>
            Activity from your team will appear here.
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <Avatar name={a.title} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium truncate" style={{ color: 'var(--ink-primary)' }}>
                    {a.title}
                  </div>
                  <div className="text-[12px] line-clamp-2" style={{ color: 'var(--ink-secondary)' }}>
                    {a.subtitle}
                  </div>
                  <div className="text-[11px] mt-1 inline-flex items-center gap-1" style={{ color: 'var(--ink-tertiary)' }}>
                    <Clock size={10} /> {a.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function buildEmptyActivity() {
  const series: { week: string; updates: number }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    series.push({
      week: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      updates: 0,
    });
  }
  return series;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
