import { useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  FileText,
  ListChecks,
  Sparkles,
  Flag,
  Play,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mic,
} from 'lucide-react';
import type { Meeting } from '../types';
import { Chip } from './ui/Chip';
import { Avatar } from './ui/Avatar';
import { ProgressBar } from './ui/ProgressBar';

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  programName?: string;
  onClose: () => void;
}

const STATUS_TONE: Record<Meeting['status'], 'success' | 'warning' | 'sky' | 'danger' | 'neutral'> = {
  ready: 'success',
  processing: 'sky',
  transcribing: 'warning',
  recording: 'danger',
};

function statusIcon(status: Meeting['status']) {
  switch (status) {
    case 'ready': return <CheckCircle2 size={12} />;
    case 'processing': return <Loader2 size={12} className="animate-spin" />;
    case 'transcribing': return <Mic size={12} />;
    case 'recording': return <Mic size={12} />;
    default: return <AlertCircle size={12} />;
  }
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MeetingDetailModal({ meeting, programName, onClose }: MeetingDetailModalProps) {
  // Lock scroll + ESC to close
  useEffect(() => {
    if (!meeting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [meeting, onClose]);

  if (!meeting) return null;

  const summary = meeting.summary?.trim();
  const keyPoints = meeting.key_points?.filter(Boolean) || [];
  const actionItems = meeting.action_items || [];
  const decisions = meeting.decisions || [];
  const hasAnyContent =
    !!summary || keyPoints.length > 0 || actionItems.length > 0 || decisions.length > 0;
  const isProcessing = meeting.status !== 'ready';
  const progressValue = typeof meeting.progress === 'number' ? meeting.progress : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ perspective: '1200px' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-modal-title"
    >
      {/* Portal backdrop — a dark plane with a circular aperture that dilates open */}
      <div
        className="absolute inset-0 animate-portal-open"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.72) 55%, rgba(15,23,42,0.82) 100%)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Dark "hole" ring under the modal — a flat elliptical shadow suggesting a
          trap door the card emerged from */}
      <div
        aria-hidden="true"
        className="absolute animate-hole-shadow pointer-events-none"
        style={{
          left: '50%',
          bottom: 'max(24px, calc(50vh - 440px))',
          width: 'min(680px, 80vw)',
          height: '40px',
          transform: 'translate(-50%, 0)',
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 70%)',
          filter: 'blur(6px)',
        }}
      />

      {/* Panel — pops from hole */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col animate-pop-from-hole"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow:
            '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in oklab, var(--coral-solid) 20%, transparent)',
          willChange: 'transform, opacity, filter',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-start justify-between gap-4"
          style={{
            borderBottom: '1px solid var(--border)',
            background:
              'linear-gradient(180deg, color-mix(in oklab, var(--coral-solid) 6%, transparent) 0%, transparent 100%)',
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Chip tone={STATUS_TONE[meeting.status]} size="xs" icon={statusIcon(meeting.status)}>
                {meeting.status}
              </Chip>
              {programName && (
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--ink-tertiary)' }}>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--coral-solid)' }}
                  />
                  {programName}
                </span>
              )}
            </div>
            <h2
              id="meeting-modal-title"
              className="text-xl md:text-2xl font-semibold leading-tight"
              style={{ color: 'var(--ink-primary)', letterSpacing: '-0.015em' }}
            >
              {meeting.title}
            </h2>
            <div
              className="flex items-center gap-4 mt-2 text-xs flex-wrap"
              style={{ color: 'var(--ink-tertiary)' }}
            >
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(meeting.date).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {formatDuration(meeting.duration_seconds)}
              </span>
              {meeting.attendees?.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users size={12} />
                  {meeting.attendees.length} attendee{meeting.attendees.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close meeting details"
            className="flex-shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-full transition-colors focus-ring"
            style={{ color: 'var(--ink-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Processing progress — prominent banner while transcribing / extracting */}
          {isProcessing && (
            <section
              className="rounded-2xl p-5"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in oklab, var(--coral-solid) 8%, transparent) 0%, color-mix(in oklab, var(--coral-solid) 2%, transparent) 100%)',
                border: '1px solid color-mix(in oklab, var(--coral-solid) 25%, transparent)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
                >
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ink-primary)' }}
                  >
                    {meeting.processing_stage || 'Processing recording'}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--ink-secondary)' }}
                  >
                    Summary, key points, action items, and decisions will appear here when done.
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={progressValue} label={undefined} showValue />
                  </div>
                  {/* Stage indicator dots */}
                  <div
                    className="flex items-center gap-4 mt-3 text-xs"
                    style={{ color: 'var(--ink-tertiary)' }}
                  >
                    <span
                      className="flex items-center gap-1.5"
                      style={{
                        color: progressValue >= 60 ? 'var(--success)' : 'var(--coral-ink)',
                        fontWeight: progressValue < 60 ? 600 : 400,
                      }}
                    >
                      {progressValue >= 60 ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full animate-pulse-slow"
                          style={{ background: 'var(--coral-solid)' }}
                        />
                      )}
                      Transcribing
                    </span>
                    <span
                      className="flex items-center gap-1.5"
                      style={{
                        color:
                          progressValue >= 100
                            ? 'var(--success)'
                            : progressValue >= 60
                            ? 'var(--coral-ink)'
                            : 'var(--ink-tertiary)',
                        fontWeight: progressValue >= 60 && progressValue < 100 ? 600 : 400,
                      }}
                    >
                      {progressValue >= 100 ? (
                        <CheckCircle2 size={12} />
                      ) : progressValue >= 60 ? (
                        <span
                          className="w-2 h-2 rounded-full animate-pulse-slow"
                          style={{ background: 'var(--coral-solid)' }}
                        />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'var(--border-strong)' }}
                        />
                      )}
                      Extracting AI notes
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recording playback */}
          {meeting.recording_url && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: 'var(--ink-tertiary)', letterSpacing: '0.08em' }}
                >
                  <Play size={12} /> Recording
                </h3>
                <a
                  href={meeting.recording_url}
                  download
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--coral-ink)' }}
                >
                  <Download size={12} /> Download
                </a>
              </div>
              <audio
                controls
                src={meeting.recording_url}
                preload="metadata"
                className="w-full rounded-lg"
                style={{ background: 'var(--bg-subtle)' }}
              />
            </section>
          )}

          {/* Attendees */}
          {meeting.attendees?.length > 0 && (
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: 'var(--ink-tertiary)', letterSpacing: '0.08em' }}
              >
                <Users size={12} /> Attendees
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {meeting.attendees.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 pl-1 pr-3 h-8 rounded-full"
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Avatar name={name} size={24} />
                    <span className="text-sm" style={{ color: 'var(--ink-primary)' }}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Summary */}
          {summary && (
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: 'var(--ink-tertiary)', letterSpacing: '0.08em' }}
              >
                <FileText size={12} /> Summary
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--ink-primary)' }}
              >
                {summary}
              </p>
            </section>
          )}

          {/* Key points */}
          {keyPoints.length > 0 && (
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: 'var(--ink-tertiary)', letterSpacing: '0.08em' }}
              >
                <Sparkles size={12} /> Key points
              </h3>
              <ul className="space-y-2">
                {keyPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--ink-primary)' }}
                  >
                    <span
                      className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--coral-solid)' }}
                    />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Action items */}
          {actionItems.length > 0 && (
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: 'var(--ink-tertiary)', letterSpacing: '0.08em' }}
              >
                <ListChecks size={12} /> Action items
                <span
                  className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular"
                  style={{ background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
                >
                  {actionItems.length}
                </span>
              </h3>
              <div className="space-y-2">
                {actionItems.map((item, i) => {
                  const a = item as {
                    id?: string;
                    description?: string;
                    title?: string;
                    owner?: string;
                    assignee?: string;
                    due_date?: string;
                    due?: string;
                    status?: string;
                  };
                  const label = a.description || a.title || '(untitled action)';
                  const owner = a.owner || a.assignee;
                  const due = a.due_date || a.due;
                  return (
                    <div
                      key={a.id || i}
                      className="rounded-xl p-3 flex items-start gap-3"
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          background: 'var(--coral-soft)',
                          color: 'var(--coral-ink)',
                        }}
                      >
                        <span className="text-xs font-semibold tabular">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm leading-snug"
                          style={{ color: 'var(--ink-primary)' }}
                        >
                          {label}
                        </div>
                        {(owner || due) && (
                          <div
                            className="flex items-center gap-3 mt-1.5 text-xs flex-wrap"
                            style={{ color: 'var(--ink-tertiary)' }}
                          >
                            {owner && (
                              <span className="flex items-center gap-1">
                                <Users size={11} /> {owner}
                              </span>
                            )}
                            {due && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {new Date(due).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {a.status && (
                        <Chip
                          tone={a.status === 'done' ? 'success' : 'neutral'}
                          size="xs"
                        >
                          {a.status}
                        </Chip>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Decisions */}
          {decisions.length > 0 && (
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: 'var(--ink-tertiary)', letterSpacing: '0.08em' }}
              >
                <Flag size={12} /> Decisions
              </h3>
              <div className="space-y-2">
                {decisions.map((d, i) => {
                  const dec = d as {
                    id?: string;
                    description?: string;
                    title?: string;
                    context?: string;
                  };
                  return (
                    <div
                      key={dec.id || i}
                      className="rounded-xl p-3 border-l-4"
                      style={{
                        background: 'var(--bg-subtle)',
                        borderLeftColor: 'var(--coral-solid)',
                        border: '1px solid var(--border)',
                        borderLeft: '4px solid var(--coral-solid)',
                      }}
                    >
                      <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                        {dec.description || dec.title || '(untitled decision)'}
                      </div>
                      {dec.context && (
                        <div
                          className="text-xs mt-1 leading-relaxed"
                          style={{ color: 'var(--ink-secondary)' }}
                        >
                          {dec.context}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state when nothing has been extracted yet (and not processing) */}
          {!hasAnyContent && !isProcessing && (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px dashed var(--border-strong)',
              }}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
              >
                <Sparkles size={20} />
              </div>
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--ink-primary)' }}
              >
                Summary and action items haven't been generated yet
              </div>
              <div className="text-xs" style={{ color: 'var(--ink-secondary)' }}>
                Once transcription completes, the AI-extracted summary, key points,
                action items, and decisions will appear here automatically.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeetingDetailModal;
