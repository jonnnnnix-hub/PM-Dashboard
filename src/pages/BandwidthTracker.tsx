import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Trash2, Copy, Save, AlertTriangle,
  Activity, Sparkles,
} from 'lucide-react';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import {
  Shell, Card, CardHeader, Button, Chip, Textarea, EmptyState,
  ACCENTS, ACCENT_VAR,
} from '../components/ui';
import { MobileSummary } from '../components/MobileSummary';

export default function BandwidthTracker() {
  const { programs, currentWeek, setCurrentWeek, getWeekStart } = useApp();
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [focusNotes, setFocusNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4); // Friday

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const fetchData = async () => {
    setLoading(true);
    const weekStr = weekStart.toISOString().split('T')[0];

    const { data: allocData } = await supabase
      .from('bandwidth_allocations')
      .select('*')
      .eq('week_of', weekStr);

    const { data: notesData } = await supabase
      .from('bandwidth_notes')
      .select('*')
      .eq('week_of', weekStr);

    if (allocData) {
      const allocMap: Record<string, number> = {};
      allocData.forEach((a) => { allocMap[a.program_id] = a.percentage; });
      setAllocations(allocMap);
    } else {
      setAllocations({});
    }

    if (notesData && notesData.length > 0) {
      setFocusNotes(notesData[0].focus_notes || '');
    } else {
      setFocusNotes('');
    }

    setLoading(false);
  };

  const handleAllocationChange = (programId: string, percentage: number) => {
    setAllocations((prev) => ({ ...prev, [programId]: percentage }));
  };

  const handleSave = async () => {
    setSaving(true);
    const weekStr = weekStart.toISOString().split('T')[0];

    try {
      const allocationUpserts = Object.entries(allocations).map(([programId, percentage]) => ({
        week_of: weekStr,
        program_id: programId,
        percentage,
      }));

      if (allocationUpserts.length > 0) {
        const { error: allocError } = await supabase
          .from('bandwidth_allocations')
          .upsert(allocationUpserts, { onConflict: 'week_of,program_id' });
        if (allocError) throw allocError;
      }

      if (focusNotes.trim()) {
        const { error: notesError } = await supabase
          .from('bandwidth_notes')
          .upsert(
            { week_of: weekStr, focus_notes: focusNotes },
            { onConflict: 'week_of' }
          );
        if (notesError) throw notesError;
      }
      setSavedAt(new Date());
    } catch (error) {
      console.error('Error saving bandwidth:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateExport = () => {
    const sortedPrograms = programs
      .filter((p) => allocations[p.id])
      .sort((a, b) => (allocations[b.id] || 0) - (allocations[a.id] || 0));

    let md = `## Bandwidth Allocation - ${fmt(weekStart)} - ${fmt(weekEnd)}\n\n`;
    md += `**Total Utilization:** ${totalAllocation}%\n\n`;
    md += `### Allocations\n\n| Program | Allocation |\n|---------|------------|\n`;
    sortedPrograms.forEach((p) => {
      md += `| ${p.name} (${p.codename}) | ${allocations[p.id]}% |\n`;
    });
    if (focusNotes.trim()) md += `\n### Focus & Context\n\n${focusNotes}\n`;
    return md;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateExport());
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeek(newDate);
  };

  const isCurrentWeek =
    weekStart.toISOString().split('T')[0] ===
    getWeekStart(new Date()).toISOString().split('T')[0];

  // Capacity tone
  const capacityTone =
    totalAllocation > 100 ? 'danger' : totalAllocation > 90 ? 'warning' : 'success';

  // Chart data — pill bar per active program
  const activePrograms = programs.filter((p) => p.status !== 'closed');
  const chartData = useMemo(
    () =>
      activePrograms.map((p, i) => ({
        name: p.codename || p.name,
        full: p.name,
        value: allocations[p.id] || 0,
        accent: ACCENTS[i % ACCENTS.length],
      })),
    [activePrograms, allocations]
  );

  return (
    <Shell
      title="Bandwidth tracker"
      subtitle="Plan how your week is split across programs"
      topBarRight={
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Copy size={15} />}
            onClick={copyToClipboard}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Save size={15} />}
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>
        </div>
      }
    >
      {/* Mobile: read-only summary */}
      <div className="lg:hidden">
        <MobileSummary programs={programs} pageLabel="Bandwidth" />
      </div>

      {/* Desktop only */}
      <div className="hidden lg:block">
      {/* Week navigator + capacity hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Week selector */}
        <Card padding="md" className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => navigateWeek('prev')}
            className="w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--ink-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="text-[20px] font-semibold tabular" style={{ color: 'var(--ink-primary)', letterSpacing: '-0.02em' }}>
              {fmt(weekStart)} — {fmt(weekEnd)}
            </div>
            <div className="mt-1.5">
              {isCurrentWeek ? (
                <Chip tone="coral" size="sm">Current week</Chip>
              ) : (
                <Chip tone="neutral" size="sm">Historical</Chip>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => navigateWeek('next')}
            className="w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--ink-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronRight size={18} />
          </button>
        </Card>

        {/* Capacity */}
        <Card padding="md" className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-micro">Total utilization</div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span
                  className="text-[44px] font-bold tabular leading-none"
                  style={{ color: 'var(--ink-primary)', letterSpacing: '-0.03em' }}
                >
                  {totalAllocation}
                </span>
                <span className="text-[20px] font-semibold" style={{ color: 'var(--ink-tertiary)' }}>%</span>
                <span className="ml-2">
                  <Chip tone={capacityTone} size="sm">
                    {totalAllocation > 100
                      ? `Over by ${totalAllocation - 100}%`
                      : totalAllocation > 90
                      ? 'Near capacity'
                      : totalAllocation === 0
                      ? 'Unallocated'
                      : 'Healthy'}
                  </Chip>
                </span>
              </div>
            </div>
            {savedAt && (
              <span className="text-[11px]" style={{ color: 'var(--ink-tertiary)' }}>
                Saved {savedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Stacked bar */}
          <div
            className="h-3 rounded-full overflow-hidden flex"
            style={{ background: 'var(--bg-subtle)' }}
          >
            {chartData.filter((d) => d.value > 0).map((d, i) => (
              <div
                key={i}
                style={{
                  width: `${Math.max(0, Math.min(100, (d.value / Math.max(totalAllocation, 100)) * 100))}%`,
                  background: ACCENT_VAR[d.accent].solid,
                  transition: 'width 240ms ease',
                }}
                title={`${d.full}: ${d.value}%`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {chartData
              .filter((d) => d.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
              .map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--ink-secondary)' }}>
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: ACCENT_VAR[d.accent].solid }}
                  />
                  {d.full}
                  <span className="tabular font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {d.value}%
                  </span>
                </span>
              ))}
            {totalAllocation > 100 && (
              <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: 'var(--danger)' }}>
                <AlertTriangle size={11} /> Replan or escalate
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Charts + sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pill bar chart */}
        <Card padding="md" className="lg:col-span-3">
          <CardHeader
            title="Allocation per program"
            subtitle="Weekly view, percentage of focused time"
            action={<Chip tone="indigo" size="sm">Weekly</Chip>}
          />
          {chartData.length === 0 ? (
            <EmptyState
              icon={<Activity size={20} />}
              title="No active programs to allocate"
              description="Add a program from the Dashboard to start planning your week."
              accent="amber"
            />
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} barCategoryGap="32%" margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <defs>
                    {ACCENTS.map((name) => (
                      <linearGradient key={name} id={`bw-${name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT_VAR[name].solid} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={ACCENT_VAR[name].solid} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} interval={0} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} unit="%" width={40} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-subtle)', opacity: 0.4 }}
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 12,
                      boxShadow: 'var(--shadow-md)',
                      color: 'var(--ink-primary)',
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v}%`, 'Allocated']}
                  />
                  <Bar dataKey="value" radius={[12, 12, 12, 12]} maxBarSize={48}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={`url(#bw-${d.accent})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Notes side-by-side */}
        <Card padding="md" className="lg:col-span-2 flex flex-col">
          <CardHeader
            title="Weekly focus & context"
            subtitle="Add notes for your manager 1:1"
            icon={<Sparkles size={16} />}
          />
          <Textarea
            value={focusNotes}
            onChange={(e) => setFocusNotes(e.target.value)}
            rows={9}
            placeholder="What's driving your bandwidth this week? Any context for your manager — risks, dependencies, or a prioritization call you'd like to discuss."
            className="flex-1"
          />
          <div className="text-[11px] mt-2" style={{ color: 'var(--ink-tertiary)' }}>
            Saved with this week's allocations.
          </div>
        </Card>
      </div>

      {/* Sliders */}
      <Card padding="md" className="mt-6">
        <CardHeader
          title="Program allocations"
          subtitle="Drag to set weekly bandwidth — total should land near 100%"
        />
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse-slow rounded-lg" style={{ background: 'var(--bg-subtle)' }} />
            ))}
          </div>
        ) : activePrograms.length === 0 ? (
          <EmptyState
            icon={<Activity size={20} />}
            title="No active programs"
            description="Once programs exist, you'll be able to slot them into your week here."
            accent="teal"
          />
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {activePrograms.map((program, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const v = ACCENT_VAR[accent];
              const value = allocations[program.id] || 0;
              return (
                <li key={program.id} className="flex items-center gap-4 py-3">
                  <div className="w-44 flex-shrink-0 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: v.solid }}
                      />
                      <div className="text-[13px] font-medium truncate" style={{ color: 'var(--ink-primary)' }}>
                        {program.name}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
                      {program.codename}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={value}
                    onChange={(e) => handleAllocationChange(program.id, parseInt(e.target.value))}
                    className="lpmo-range flex-1"
                    style={{
                      background: `linear-gradient(to right, ${v.solid} 0%, ${v.solid} ${value}%, var(--bg-subtle) ${value}%, var(--bg-subtle) 100%)`,
                    }}
                    aria-label={`${program.name} allocation`}
                  />
                  <div className="w-14 text-right tabular text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    {value}%
                  </div>
                  <button
                    type="button"
                    aria-label={`Clear ${program.name}`}
                    onClick={() => handleAllocationChange(program.id, 0)}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--ink-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--danger)';
                      e.currentTarget.style.background = 'var(--danger-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--ink-tertiary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      </div>
    </Shell>
  );
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
