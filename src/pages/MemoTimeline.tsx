import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Calendar, ChevronLeft, ChevronRight, Plus, GanttChart } from 'lucide-react';
import {
  addDays, addMonths, differenceInCalendarDays, format, isSameDay,
  startOfMonth, endOfMonth, startOfDay,
} from 'date-fns';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Shell, Card, CardHeader, Button, Chip, EmptyState } from '../components/ui';
import { NewProgramModal } from '../components/NewProgramModal';
import { IngestPRDModal } from '../components/IngestPRDModal';
import { MobileSummary } from '../components/MobileSummary';
import { computeLRMDates, LRM_META, type LRMMilestone } from '../lib/lrm';
import type { Program } from '../types';

interface Marker {
  kind: LRMMilestone;
  date: Date;
}

function buildProgramMarkers(p: Program): Marker[] {
  const dates = computeLRMDates(p.launch_date);
  if (!dates) return [];
  return [
    { kind: 't60', date: dates.t60 },
    { kind: 't30', date: dates.t30 },
    { kind: 't1',  date: dates.t1 },
    { kind: 'launch', date: dates.launch },
  ];
}

// Visual density: px per day along the horizontal axis
const DAY_WIDTH = 14;
const ROW_HEIGHT = 68;
const LABEL_COL_WIDTH_DESKTOP = 220;
const LABEL_COL_WIDTH_MOBILE = 140;

export default function MemoTimeline() {
  const navigate = useNavigate();
  const { refreshPrograms } = useApp();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeStart, setRangeStart] = useState<Date>(() => startOfDay(addDays(new Date(), -14)));
  const [rangeMonths, setRangeMonths] = useState(6);
  const [newProgramOpen, setNewProgramOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [hoverMarker, setHoverMarker] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('programs')
      .select('*')
      .order('launch_date', { ascending: true, nullsFirst: false });
    setPrograms((data as Program[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const today = startOfDay(new Date());

  const rangeEnd = useMemo(
    () => endOfMonth(addMonths(rangeStart, rangeMonths - 1)),
    [rangeStart, rangeMonths]
  );
  const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) + 1;
  const axisWidth = totalDays * DAY_WIDTH;

  // Month header segments
  const monthSegments = useMemo(() => {
    const segs: { label: string; start: number; width: number; year: number }[] = [];
    let cursor = startOfMonth(rangeStart);
    while (cursor <= rangeEnd) {
      const segStart = cursor < rangeStart ? rangeStart : cursor;
      const monthEnd = endOfMonth(cursor);
      const segEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;
      const startOffset = differenceInCalendarDays(segStart, rangeStart);
      const width = (differenceInCalendarDays(segEnd, segStart) + 1) * DAY_WIDTH;
      segs.push({
        label: format(cursor, 'MMM'),
        year: cursor.getFullYear(),
        start: startOffset * DAY_WIDTH,
        width,
      });
      cursor = addMonths(cursor, 1);
    }
    return segs;
  }, [rangeStart, rangeEnd]);

  // Programs that have at least one marker in range OR have any launch_date
  const visiblePrograms = useMemo(() => {
    return programs.filter((p) => {
      if (!p.launch_date) return false;
      const markers = buildProgramMarkers(p);
      return markers.some((m) => m.date >= rangeStart && m.date <= rangeEnd);
    });
  }, [programs, rangeStart, rangeEnd]);

  const unscheduledCount = programs.filter((p) => !p.launch_date).length;

  const todayOffset = useMemo(() => {
    if (today < rangeStart || today > rangeEnd) return null;
    return differenceInCalendarDays(today, rangeStart) * DAY_WIDTH + DAY_WIDTH / 2;
  }, [today, rangeStart, rangeEnd]);

  function shift(months: number) {
    setRangeStart((d) => startOfDay(addMonths(d, months)));
  }

  function goToday() {
    setRangeStart(startOfDay(addDays(new Date(), -14)));
  }

  function markerX(date: Date) {
    return differenceInCalendarDays(date, rangeStart) * DAY_WIDTH + DAY_WIDTH / 2;
  }

  const legendItems: LRMMilestone[] = ['t60', 't30', 't1', 'launch'];

  // Responsive label column
  const [labelColWidth, setLabelColWidth] = useState<number>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? LABEL_COL_WIDTH_MOBILE : LABEL_COL_WIDTH_DESKTOP
  );
  useEffect(() => {
    const onResize = () => {
      setLabelColWidth(window.innerWidth < 768 ? LABEL_COL_WIDTH_MOBILE : LABEL_COL_WIDTH_DESKTOP);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <Shell
      title="Memo timeline"
      subtitle="Launch Readiness Memos auto-calculated from each program's launch date"
      topBarRight={
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="secondary" leftIcon={<Calendar size={16} />} onClick={() => setIngestOpen(true)}>
            Ingest PRD
          </Button>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setNewProgramOpen(true)}>
            New program
          </Button>
        </div>
      }
    >
      {/* Mobile: read-only timeline summary */}
      <div className="lg:hidden">
        <MobileSummary programs={programs} pageLabel="Timeline" />
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
      {/* Controls + legend */}
      <Card padding="md" className="mb-5">
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" leftIcon={<ChevronLeft size={14} />} onClick={() => shift(-1)}>
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={14} />} onClick={() => shift(1)}>
              <span className="hidden sm:inline">Next</span>
            </Button>
            <div className="ml-1 sm:ml-3 flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-subtle)' }}>
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setRangeMonths(m)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                  style={{
                    background: rangeMonths === m ? 'var(--bg-surface)' : 'transparent',
                    color: rangeMonths === m ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                    boxShadow: rangeMonths === m ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {m} mo
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            {legendItems.map((k) => {
              const meta = LRM_META[k];
              return (
                <div key={k} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-secondary)' }}>
                  {k === 'launch' ? (
                    <Flag size={14} style={{ color: meta.accent, fill: meta.accent }} />
                  ) : (
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: meta.accent }} />
                  )}
                  <span>{meta.short}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Launch Readiness calendar"
          subtitle={`${format(rangeStart, 'MMM d, yyyy')} → ${format(rangeEnd, 'MMM d, yyyy')}`}
          action={
            visiblePrograms.length > 0 ? (
              <Chip tone="indigo" size="sm">{visiblePrograms.length} programs</Chip>
            ) : null
          }
        />

        {loading ? (
          <div className="px-6 py-16 text-sm" style={{ color: 'var(--ink-tertiary)' }}>Loading timeline…</div>
        ) : visiblePrograms.length === 0 ? (
          <div className="px-6 py-10">
            <EmptyState
              icon={<GanttChart size={28} />}
              title="No programs with launch dates in this window"
              description={
                unscheduledCount > 0
                  ? `${unscheduledCount} program${unscheduledCount === 1 ? '' : 's'} missing launch dates. Add one to see LRM milestones.`
                  : 'Create or ingest a program to start tracking launch readiness memos.'
              }
              action={
                <div className="flex gap-2 justify-center">
                  <Button variant="secondary" leftIcon={<Calendar size={16} />} onClick={() => setIngestOpen(true)}>
                    Ingest PRD
                  </Button>
                  <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setNewProgramOpen(true)}>
                    New program
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="flex" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Fixed label column */}
            <div
              className="flex-shrink-0 sticky left-0 z-10"
              style={{ width: labelColWidth, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
            >
              {/* Empty header matching month+week rows (48+28=76) */}
              <div style={{ height: 76, borderBottom: '1px solid var(--border)' }} />
              {visiblePrograms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/program/${p.id}`)}
                  className="w-full text-left px-3 md:px-5 flex flex-col justify-center hover:bg-[var(--bg-subtle)] transition-colors"
                  style={{ height: ROW_HEIGHT, borderBottom: '1px solid var(--border)' }}
                >
                  <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--ink-primary)' }}>
                    {p.name}
                  </div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--ink-tertiary)' }}>
                    {p.codename ? `${p.codename} · ` : ''}{format(new Date(p.launch_date + 'T00:00:00'), 'MMM d, yyyy')}
                  </div>
                </button>
              ))}
            </div>

            {/* Scroll area */}
            <div className="flex-1 overflow-x-auto">
              <div style={{ width: axisWidth, position: 'relative' }}>
                {/* Month header row */}
                <div style={{ display: 'flex', height: 28, borderBottom: '1px solid var(--border)' }}>
                  {monthSegments.map((seg, i) => (
                    <div
                      key={i}
                      className="text-[11px] font-semibold uppercase tracking-wide flex items-center px-2"
                      style={{
                        position: 'absolute',
                        left: seg.start,
                        width: seg.width,
                        height: 28,
                        borderRight: '1px solid var(--border)',
                        color: 'var(--ink-secondary)',
                        background: 'var(--bg-subtle)',
                      }}
                    >
                      {seg.label} {seg.year !== new Date().getFullYear() ? `’${String(seg.year).slice(2)}` : ''}
                    </div>
                  ))}
                </div>

                {/* Week tick row */}
                <div style={{ height: 48, position: 'relative', borderBottom: '1px solid var(--border)' }}>
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const d = addDays(rangeStart, i);
                    const showLabel = d.getDay() === 1; // Mondays
                    const isFirstOfMonth = d.getDate() === 1;
                    return (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: i * DAY_WIDTH,
                          top: 0,
                          bottom: 0,
                          width: DAY_WIDTH,
                          borderLeft: isFirstOfMonth
                            ? '1px solid var(--border-strong)'
                            : showLabel
                              ? '1px dashed var(--border)'
                              : 'none',
                        }}
                      >
                        {showLabel && (
                          <div
                            className="text-[10px] mt-1 ml-1 tabular"
                            style={{ color: 'var(--ink-tertiary)' }}
                          >
                            {format(d, 'd')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Today line */}
                {todayOffset !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      left: todayOffset,
                      top: 28,
                      bottom: 0,
                      width: 1,
                      background: 'var(--coral)',
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      className="absolute -top-4 -translate-x-1/2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--coral)', color: '#fff' }}
                    >
                      TODAY
                    </div>
                  </div>
                )}

                {/* Program rows */}
                {visiblePrograms.map((p) => {
                  const markers = buildProgramMarkers(p);
                  const inRange = markers.filter((m) => m.date >= rangeStart && m.date <= rangeEnd);
                  if (inRange.length === 0) return null;
                  const xs = inRange.map((m) => markerX(m.date));
                  const minX = Math.min(...xs);
                  const maxX = Math.max(...xs);
                  return (
                    <div
                      key={p.id}
                      style={{
                        position: 'relative',
                        height: ROW_HEIGHT,
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {/* Day grid stripes for row */}
                      <div className="absolute inset-0 pointer-events-none">
                        {monthSegments.map((seg, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'absolute',
                              left: seg.start,
                              width: seg.width,
                              top: 0,
                              bottom: 0,
                              background: i % 2 === 0 ? 'transparent' : 'var(--bg-subtle)',
                              opacity: 0.4,
                            }}
                          />
                        ))}
                      </div>

                      {/* Connector line */}
                      {maxX > minX && (
                        <div
                          style={{
                            position: 'absolute',
                            left: minX,
                            width: maxX - minX,
                            top: ROW_HEIGHT / 2 - 1,
                            height: 2,
                            background: 'linear-gradient(90deg, var(--amber), var(--coral), var(--rose))',
                            borderRadius: 2,
                            opacity: 0.35,
                          }}
                        />
                      )}

                      {/* Markers */}
                      {inRange.map((m) => {
                        const x = markerX(m.date);
                        const meta = LRM_META[m.kind];
                        const id = `${p.id}-${m.kind}`;
                        const isLaunch = m.kind === 'launch';
                        const isToday = isSameDay(m.date, today);
                        return (
                          <div
                            key={m.kind}
                            onMouseEnter={() => setHoverMarker(id)}
                            onMouseLeave={() => setHoverMarker(null)}
                            onClick={() => navigate(`/program/${p.id}`)}
                            style={{
                              position: 'absolute',
                              left: x,
                              top: ROW_HEIGHT / 2,
                              transform: 'translate(-50%, -50%)',
                              zIndex: hoverMarker === id ? 5 : 3,
                              cursor: 'pointer',
                            }}
                          >
                            {isLaunch ? (
                              <div
                                className="w-7 h-7 rounded-lg inline-flex items-center justify-center"
                                style={{
                                  background: meta.accent,
                                  color: '#fff',
                                  boxShadow: isToday ? '0 0 0 3px var(--coral-soft)' : 'var(--shadow-sm)',
                                }}
                              >
                                <Flag size={14} fill="#fff" />
                              </div>
                            ) : (
                              <div
                                className="rounded-full"
                                style={{
                                  width: 14,
                                  height: 14,
                                  background: meta.accent,
                                  border: '2px solid var(--bg-surface)',
                                  boxShadow: isToday ? `0 0 0 3px var(--coral-soft)` : 'var(--shadow-sm)',
                                }}
                              />
                            )}

                            {hoverMarker === id && (
                              <div
                                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 rounded-lg px-2.5 py-1.5 whitespace-nowrap text-[11px] pointer-events-none"
                                style={{
                                  background: 'var(--ink-primary)',
                                  color: 'var(--bg-surface)',
                                  boxShadow: 'var(--shadow-md)',
                                  zIndex: 10,
                                }}
                              >
                                <div className="font-semibold">{meta.label}</div>
                                <div style={{ opacity: 0.85 }}>{format(m.date, 'EEE, MMM d, yyyy')}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Unscheduled callout */}
      {unscheduledCount > 0 && (
        <div className="mt-4 text-xs" style={{ color: 'var(--ink-tertiary)' }}>
          {unscheduledCount} program{unscheduledCount === 1 ? '' : 's'} without a launch date are hidden from the timeline.
        </div>
      )}
      </div>

      <NewProgramModal
        isOpen={newProgramOpen}
        onClose={() => setNewProgramOpen(false)}
        onSuccess={() => { refreshPrograms?.(); load(); }}
      />
      <IngestPRDModal
        isOpen={ingestOpen}
        onClose={() => setIngestOpen(false)}
        onSuccess={() => { refreshPrograms?.(); load(); }}
      />
    </Shell>
  );
}
