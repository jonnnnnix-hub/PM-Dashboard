import { useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useDataStore } from '@/data/store';
import { formatDate, daysUntilLaunch, generateId } from '@/lib/utils';
import { format } from 'date-fns';

// --- Types ---

type MilestoneStatus = 'COMPLETE' | 'ON TRACK' | 'NOT STARTED' | 'AT RISK';

interface MilestoneRow {
  id: string;
  name: string;
  status: MilestoneStatus;
  dueDate: string;
}

interface LaunchDateRow {
  id: string;
  label: string;
  date: string;
  days: string;
}

interface SlideData {
  dateUpdated: string;
  programName: string;
  leads: string;
  overviewLinks: string;
  overviewBody: string;
  highlightsWeek: string;
  highlights: string[];
  prioritiesWeek: string;
  priorities: string[];
  decisions: string[];
  launchDates: LaunchDateRow[];
  milestones: MilestoneRow[];
  milestonesSubtitle: string;
  footer: string;
}

// --- Constants ---

const TEAL = '#00838F';
const TEAL_DARK = '#00616D';
const STATUS_STYLES: Record<MilestoneStatus, { color: string; fontWeight: number }> = {
  'COMPLETE': { color: '#00796B', fontWeight: 700 },
  'ON TRACK': { color: '#1565C0', fontWeight: 700 },
  'NOT STARTED': { color: '#C62828', fontWeight: 700 },
  'AT RISK': { color: '#EF6C00', fontWeight: 700 },
};

const MILESTONE_STATUSES: MilestoneStatus[] = ['COMPLETE', 'ON TRACK', 'NOT STARTED', 'AT RISK'];

// --- Editable field helpers ---

function EField({ value, onChange, className, style, placeholder, multiline }: {
  value: string; onChange: (v: string) => void; className?: string; style?: React.CSSProperties;
  placeholder?: string; multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    background: 'transparent', border: '1px solid transparent', outline: 'none',
    width: '100%', padding: '2px 4px', margin: '-2px -4px', fontFamily: 'inherit',
    fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', lineHeight: 'inherit',
    letterSpacing: 'inherit', resize: 'none', ...style,
  };
  const hoverFocus = 'hover:!border-blue-300 focus:!border-blue-400 focus:!bg-blue-50/30';

  if (multiline) {
    return (
      <textarea
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`${hoverFocus} ${className || ''}`} style={base} rows={3}
      />
    );
  }
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`${hoverFocus} ${className || ''}`} style={base}
    />
  );
}

// --- Bullet list ---

function BulletList({ items, onChange, onAdd, onRemove }: {
  items: string[]; onChange: (i: number, v: string) => void;
  onAdd: () => void; onRemove: (i: number) => void;
}) {
  return (
    <div style={{ paddingLeft: 20 }}>
      {items.map((item, i) => (
        <div key={i} className="group flex items-start gap-1" style={{ marginBottom: 2 }}>
          <span style={{ marginTop: 6, fontSize: 8, color: '#333', flexShrink: 0 }}>&#9675;</span>
          <div className="flex-1">
            <EField value={item} onChange={v => onChange(i, v)} placeholder="Enter item..."
              style={{ fontSize: 11, lineHeight: '1.4' }} />
          </div>
          <button onClick={() => onRemove(i)}
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            style={{ color: '#C62828', marginTop: 2 }} title="Remove">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button onClick={onAdd}
        className="flex items-center gap-1 mt-1 hover:text-blue-700 transition-colors"
        style={{ fontSize: 10, color: '#999' }}>
        <Plus size={10} /> Add item
      </button>
    </div>
  );
}

// --- Main component ---

export function ExecSlidePage() {
  const { id } = useParams<{ id: string }>();
  const { programs, weeklyStatuses, workstreams } = useDataStore();
  const slideRef = useRef<HTMLDivElement>(null);

  const program = programs.find(p => p.id === id);

  const latestStatus = useMemo(() => {
    const statuses = weeklyStatuses.filter(s => s.program_id === id);
    if (statuses.length === 0) return undefined;
    return statuses.sort((a, b) => b.week_of.localeCompare(a.week_of))[0];
  }, [weeklyStatuses, id]);

  const programWorkstreams = useMemo(
    () => workstreams.filter(w => w.program_id === id),
    [workstreams, id]
  );

  function emptySlide(): SlideData {
    return {
      dateUpdated: format(new Date(), 'MMM-dd').toUpperCase(),
      programName: 'Program Name',
      leads: 'LPMO Leads: ',
      overviewLinks: 'Program Runbook | Planning Tracker',
      overviewBody: '',
      highlightsWeek: `Week of ${format(new Date(), 'MMM-dd').toUpperCase()}:`,
      highlights: [''],
      prioritiesWeek: `Week of ${format(new Date(), 'MMM-dd').toUpperCase()}:`,
      priorities: [''],
      decisions: [''],
      launchDates: [{ id: generateId(), label: 'Release 1', date: 'TBD', days: 'TBD' }],
      milestones: [],
      milestonesSubtitle: 'End-end detailed project plan linked HERE',
      footer: 'Program Management \u2022 PM Dashboard',
    };
  }

  function buildInitialData(): SlideData {
    if (!program) return emptySlide();

    const today = new Date();
    const days = daysUntilLaunch(program.launch_date);
    const daysLabel = days === 0 ? 'LAUNCH DAY' : days > 0 ? `~${days} days` : `${Math.abs(days)} days ago`;

    const milestones: MilestoneRow[] = programWorkstreams.map(ws => ({
      id: generateId(),
      name: ws.name,
      status: ws.status === 'complete' ? 'COMPLETE' as MilestoneStatus
        : ws.status === 'on-track' ? 'ON TRACK' as MilestoneStatus
        : ws.status === 'blocked' ? 'AT RISK' as MilestoneStatus
        : 'AT RISK' as MilestoneStatus,
      dueDate: '',
    }));

    return {
      dateUpdated: format(today, 'MMM-dd').toUpperCase(),
      programName: program.codename
        ? `${program.codename} / ${program.name}` : program.name,
      leads: `LPMO Leads: ${program.owner}${program.stakeholders.length > 0 ? ', ' + program.stakeholders.join(', ') : ''}`,
      overviewLinks: 'Program Runbook | Program Planning Tracker',
      overviewBody: program.description,
      highlightsWeek: latestStatus
        ? `Week of ${formatDate(latestStatus.week_of, 'MMM-dd').toUpperCase()}:`
        : `Week of ${format(today, 'MMM-dd').toUpperCase()}:`,
      highlights: latestStatus?.accomplishments.length
        ? [...latestStatus.accomplishments]
        : [''],
      prioritiesWeek: latestStatus
        ? `Week of ${format(new Date(new Date(latestStatus.week_of).getTime() + 7 * 86400000), 'MMM-dd').toUpperCase()}:`
        : `Week of ${format(today, 'MMM-dd').toUpperCase()}:`,
      priorities: latestStatus?.next_steps.length
        ? [...latestStatus.next_steps]
        : [''],
      decisions: latestStatus?.decisions_needed.length
        ? [...latestStatus.decisions_needed]
        : [''],
      launchDates: [
        { id: generateId(), label: program.name, date: formatDate(program.launch_date, 'MMM-dd').toUpperCase(), days: daysLabel },
      ],
      milestones,
      milestonesSubtitle: 'End-end detailed project plan linked HERE',
      footer: 'Program Management \u2022 PM Dashboard',
    };
  }

  const [data, setData] = useState<SlideData>(buildInitialData);

  // Field updaters
  const set = <K extends keyof SlideData>(key: K, val: SlideData[K]) =>
    setData(prev => ({ ...prev, [key]: val }));

  const updateListItem = (key: 'highlights' | 'priorities' | 'decisions', i: number, v: string) =>
    setData(prev => ({ ...prev, [key]: prev[key].map((item, idx) => idx === i ? v : item) }));

  const addListItem = (key: 'highlights' | 'priorities' | 'decisions') =>
    setData(prev => ({ ...prev, [key]: [...prev[key], ''] }));

  const removeListItem = (key: 'highlights' | 'priorities' | 'decisions', i: number) =>
    setData(prev => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));

  const updateMilestone = (id: string, updates: Partial<MilestoneRow>) =>
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, ...updates } : m),
    }));

  const addMilestone = () =>
    setData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { id: generateId(), name: '', status: 'NOT STARTED' as MilestoneStatus, dueDate: '' }],
    }));

  const removeMilestone = (id: string) =>
    setData(prev => ({ ...prev, milestones: prev.milestones.filter(m => m.id !== id) }));

  const updateLaunchDate = (id: string, updates: Partial<LaunchDateRow>) =>
    setData(prev => ({
      ...prev,
      launchDates: prev.launchDates.map(l => l.id === id ? { ...l, ...updates } : l),
    }));

  const addLaunchDate = () =>
    setData(prev => ({
      ...prev,
      launchDates: [...prev.launchDates, { id: generateId(), label: '', date: 'TBD', days: 'TBD' }],
    }));

  const removeLaunchDate = (id: string) =>
    setData(prev => ({ ...prev, launchDates: prev.launchDates.filter(l => l.id !== id) }));

  const handlePrint = () => window.print();

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-medium text-slate-300 mb-2">Program not found</h2>
        <Link to="/" className="text-sm text-blue-400 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link to={`/programs/${id}`} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={14} /> Back to Program
          </Link>
          <span className="text-sm font-medium text-slate-200">{program.name} — Exec Slide</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setData(buildInitialData())} className="btn-ghost flex items-center gap-1 text-xs text-slate-400">
            <RotateCcw size={13} /> Re-generate
          </button>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2 text-xs">
            <Printer size={14} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Slide container */}
      <div className="flex justify-center py-8 print:py-0 px-4 print:px-0">
        <div
          ref={slideRef}
          className="bg-white shadow-2xl print:shadow-none w-full"
          style={{
            maxWidth: 1140,
            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
            color: '#222',
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {/* === HEADER ROW === */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 28px 0 28px' }}>
            {/* Left: Program info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                <span>DATE UPDATED: </span>
                <EField value={data.dateUpdated} onChange={v => set('dateUpdated', v)}
                  style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, display: 'inline-block', width: 80 }} />
              </div>
              <div>
                <EField value={data.programName} onChange={v => set('programName', v)}
                  style={{ fontSize: 26, fontWeight: 700, color: '#111', lineHeight: 1.2 }} />
              </div>
              <div style={{ marginTop: 2 }}>
                <EField value={data.leads} onChange={v => set('leads', v)}
                  style={{ fontSize: 11, color: '#444' }} />
              </div>
            </div>

            {/* Right: Launch date box */}
            <div style={{ minWidth: 320, maxWidth: 380, marginLeft: 20, border: '1px solid #ccc', flexShrink: 0 }}>
              <div style={{ display: 'flex', background: TEAL_DARK, color: 'white' }}>
                <div style={{ flex: 1, padding: '6px 12px', fontSize: 11, fontWeight: 600, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  Launch date
                </div>
                <div style={{ flex: 1, padding: '6px 12px', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                  Days to launch
                </div>
              </div>
              {data.launchDates.map(ld => (
                <div key={ld.id} className="group" style={{ display: 'flex', borderTop: '1px solid #e5e5e5', alignItems: 'center' }}>
                  <div style={{ flex: 1, padding: '4px 8px', borderRight: '1px solid #e5e5e5', position: 'relative' }}>
                    <EField value={ld.label} onChange={v => updateLaunchDate(ld.id, { label: v })}
                      style={{ fontSize: 10, color: '#333', fontWeight: 500 }} placeholder="Release name" />
                    <EField value={ld.date} onChange={v => updateLaunchDate(ld.id, { date: v })}
                      style={{ fontSize: 10, color: '#666' }} placeholder="Date" />
                  </div>
                  <div style={{ flex: 1, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <EField value={ld.days} onChange={v => updateLaunchDate(ld.id, { days: v })}
                      style={{ fontSize: 10, color: '#333', fontWeight: 500 }} placeholder="~X days" />
                    <button onClick={() => removeLaunchDate(ld.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: '#C62828' }} title="Remove">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addLaunchDate}
                className="hover:bg-gray-50 transition-colors w-full"
                style={{ fontSize: 10, color: '#999', padding: '3px 8px', textAlign: 'left' }}>
                + Add launch date
              </button>
            </div>
          </div>

          {/* === CONTENT AREA === */}
          <div style={{ display: 'flex', padding: '12px 28px 20px 28px', gap: 28, alignItems: 'flex-start' }}>
            {/* LEFT COLUMN */}
            <div style={{ flex: '1 1 55%', minWidth: 0 }}>
              {/* Program Overview */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 1 }}>
                  Program Overview
                  <span style={{ fontSize: 10, fontWeight: 400, color: TEAL, marginLeft: 8 }}>
                    <EField value={data.overviewLinks} onChange={v => set('overviewLinks', v)}
                      style={{ fontSize: 10, color: TEAL, display: 'inline-block', width: 280 }} placeholder="Runbook | Planning Tracker" />
                  </span>
                </div>
                <EField value={data.overviewBody} onChange={v => set('overviewBody', v)}
                  style={{ fontSize: 11, color: '#333', lineHeight: '1.5' }} multiline placeholder="Program description..." />
              </div>

              {/* Highlights */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 4 }}>
                  Highlights from this week
                </div>
                <div style={{ marginLeft: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#222' }}>&#8226;&nbsp;</span>
                  <EField value={data.highlightsWeek} onChange={v => set('highlightsWeek', v)}
                    style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'inline-block', width: '80%' }} />
                </div>
                <BulletList
                  items={data.highlights}
                  onChange={(i, v) => updateListItem('highlights', i, v)}
                  onAdd={() => addListItem('highlights')}
                  onRemove={i => removeListItem('highlights', i)}
                />
              </div>

              {/* Priorities */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 4 }}>
                  Priorities for next week
                </div>
                <div style={{ marginLeft: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#222' }}>&#8226;&nbsp;</span>
                  <EField value={data.prioritiesWeek} onChange={v => set('prioritiesWeek', v)}
                    style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'inline-block', width: '80%' }} />
                </div>
                <BulletList
                  items={data.priorities}
                  onChange={(i, v) => updateListItem('priorities', i, v)}
                  onAdd={() => addListItem('priorities')}
                  onRemove={i => removeListItem('priorities', i)}
                />
              </div>

              {/* Executive Decisions */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 4 }}>
                  Executive decisions required
                </div>
                <BulletList
                  items={data.decisions}
                  onChange={(i, v) => updateListItem('decisions', i, v)}
                  onAdd={() => addListItem('decisions')}
                  onRemove={i => removeListItem('decisions', i)}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ flex: '1 1 45%', minWidth: 0 }}>
              {/* Critical Milestones */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 1 }}>
                  Critical Milestones
                  <span style={{ fontSize: 9, fontWeight: 400, color: '#888', marginLeft: 6 }}>
                    <EField value={data.milestonesSubtitle} onChange={v => set('milestonesSubtitle', v)}
                      style={{ fontSize: 9, color: '#888', display: 'inline-block', width: 220 }} />
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6, fontSize: 10 }}>
                  <thead>
                    <tr style={{ background: TEAL_DARK, color: 'white' }}>
                      <th style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 600, fontSize: 10, width: '50%' }}>Milestone</th>
                      <th style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, fontSize: 10, width: '25%' }}>Status</th>
                      <th style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, fontSize: 10, width: '25%' }}>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.milestones.map((m, i) => (
                      <tr key={m.id} className="group"
                        style={{ background: i % 2 === 0 ? '#fff' : '#f8f9fa', borderBottom: '1px solid #e5e5e5' }}>
                        <td style={{ padding: '4px 8px' }}>
                          <EField value={m.name} onChange={v => updateMilestone(m.id, { name: v })}
                            style={{ fontSize: 10, color: '#333' }} placeholder="Milestone name" />
                        </td>
                        <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                          <select
                            value={m.status}
                            onChange={e => updateMilestone(m.id, { status: e.target.value as MilestoneStatus })}
                            style={{
                              fontSize: 10,
                              fontWeight: STATUS_STYLES[m.status].fontWeight,
                              color: STATUS_STYLES[m.status].color,
                              background: 'transparent',
                              border: '1px solid transparent',
                              cursor: 'pointer',
                              outline: 'none',
                              padding: '1px 2px',
                            }}
                            className="hover:!border-blue-300 focus:!border-blue-400"
                          >
                            {MILESTONE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '4px 4px', textAlign: 'center', position: 'relative' }}>
                          <div className="flex items-center gap-1 justify-center">
                            <EField value={m.dueDate} onChange={v => updateMilestone(m.id, { dueDate: v })}
                              style={{ fontSize: 10, color: '#333', fontWeight: 600, textAlign: 'center' }} placeholder="MMM-DD" />
                            <button onClick={() => removeMilestone(m.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              style={{ color: '#C62828' }} title="Remove milestone">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button onClick={addMilestone}
                  className="hover:bg-gray-50 transition-colors w-full"
                  style={{ fontSize: 10, color: '#999', padding: '4px 8px', textAlign: 'left', border: '1px solid #e5e5e5', borderTop: 'none' }}>
                  + Add milestone
                </button>
              </div>
            </div>
          </div>

          {/* === FOOTER === */}
          <div style={{ borderTop: '2px solid ' + TEAL, padding: '6px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <EField value={data.footer} onChange={v => set('footer', v)}
              style={{ fontSize: 9, color: '#888', letterSpacing: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          @page { margin: 0.4in; size: landscape; }
        }
      `}</style>
    </div>
  );
}
