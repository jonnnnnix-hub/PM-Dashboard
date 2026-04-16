import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  Square,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileAudio,
  ExternalLink,
  Search,
  Calendar,
  Clock,
  Users,
  Sparkles,
  Upload,
} from 'lucide-react';
import type { Meeting } from '../types';
import { Shell } from '../components/ui/Shell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Input, Select, Field } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { StatTile } from '../components/ui/StatTile';

const STATUS_TONE: Record<Meeting['status'], 'success' | 'warning' | 'sky' | 'danger' | 'neutral'> = {
  ready: 'success',
  processing: 'sky',
  transcribing: 'warning',
  recording: 'danger',
};

export default function MeetingsHub() {
  const { programs, meetings, addMeeting } = useApp();
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [attendees, setAttendees] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!selectedProgram || !meetingTitle) {
      alert('Please select a program and enter a meeting title');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const newMeeting: Meeting = {
          id: crypto.randomUUID(),
          program_id: selectedProgram,
          title: meetingTitle,
          date: new Date().toISOString(),
          attendees: attendees.split(',').map(a => a.trim()).filter(Boolean),
          duration_seconds: recordingTime,
          recording_url: URL.createObjectURL(audioBlob),
          transcript: '',
          summary: '',
          key_points: [],
          action_items: [],
          decisions: [],
          embedding_ids: [],
          status: 'transcribing',
          created_at: new Date().toISOString(),
        };

        addMeeting(newMeeting);
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        setMeetingTitle('');
        setAttendees('');
        setSelectedProgram('');
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchesProgram = filterProgram === 'all' || meeting.program_id === filterProgram;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        meeting.title.toLowerCase().includes(q) ||
        meeting.transcript?.toLowerCase().includes(q);
      return matchesProgram && matchesSearch;
    });
  }, [meetings, filterProgram, searchQuery]);

  const getStatusIcon = (status: Meeting['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle2 size={12} />;
      case 'processing': return <Loader2 size={12} className="animate-spin" />;
      case 'transcribing': return <FileAudio size={12} />;
      case 'recording': return <Mic size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  const totalDuration = meetings.reduce((sum, m) => sum + m.duration_seconds, 0);
  const readyCount = meetings.filter(m => m.status === 'ready').length;
  const totalActions = meetings.reduce((sum, m) => sum + (m.action_items?.length || 0), 0);

  const rightRail = (
    <div className="space-y-4">
      <Card padding="md">
        <CardHeader
          title="Filters"
          subtitle="Narrow down the meeting list"
          icon={<Search size={16} />}
        />
        <div className="space-y-3">
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search title or transcript…"
            leftIcon={<Search size={14} />}
          />
          <Select
            value={filterProgram}
            onChange={e => setFilterProgram(e.target.value)}
          >
            <option value="all">All programs</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card padding="md">
        <CardHeader
          title="Quick stats"
          subtitle="Your meeting library"
          icon={<Sparkles size={16} />}
        />
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--ink-secondary)' }}>Total meetings</span>
            <span className="font-semibold tabular" style={{ color: 'var(--ink-primary)' }}>{meetings.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--ink-secondary)' }}>Hours recorded</span>
            <span className="font-semibold tabular" style={{ color: 'var(--ink-primary)' }}>{(totalDuration / 3600).toFixed(1)}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--ink-secondary)' }}>Action items</span>
            <span className="font-semibold tabular" style={{ color: 'var(--ink-primary)' }}>{totalActions}</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const canStart = !!selectedProgram && !!meetingTitle.trim();

  return (
    <Shell
      title="Meetings Hub"
      subtitle="Record, transcribe, and search every program conversation"
      breadcrumbs={[{ label: 'Workspace' }, { label: 'Meetings' }]}
      rightRail={rightRail}
    >
      <div className="space-y-6">
        {/* KPI tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatTile label="Meetings" value={meetings.length} accent="coral" icon={<Mic size={16} />} hint="All-time" />
          <StatTile label="Ready" value={readyCount} accent="teal" icon={<CheckCircle2 size={16} />} hint="Transcribed & summarized" />
          <StatTile label="Hours" value={(totalDuration / 3600).toFixed(1)} unit="h" accent="indigo" icon={<Clock size={16} />} hint="Total recorded" />
          <StatTile label="Action items" value={totalActions} accent="amber" icon={<Sparkles size={16} />} hint="Extracted by AI" />
        </div>

        {/* Dropzone-style recording hero */}
        <Card padding="lg" elevated>
          {isRecording ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse-slow"
                  style={{ background: 'var(--danger-soft)', color: 'var(--danger-solid)' }}
                >
                  <Mic size={28} />
                </div>
                <div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>
                    Recording in progress
                  </div>
                  <div className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--ink-secondary)' }}>
                    <span className="font-mono text-xl tabular" style={{ color: 'var(--danger-solid)' }}>
                      {formatTime(recordingTime)}
                    </span>
                    <span>·</span>
                    <span>{meetingTitle}</span>
                  </div>
                </div>
              </div>
              <Button variant="danger" size="lg" leftIcon={<Square size={16} />} onClick={stopRecording}>
                Stop recording
              </Button>
            </div>
          ) : (
            <div>
              <div
                className="rounded-xl p-6 mb-5"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '2px dashed var(--border-strong)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
                  >
                    <Upload size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold" style={{ color: 'var(--ink-primary)' }}>
                      Capture a meeting
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
                      Start a live recording or drop a file. Transcription and summary run automatically.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Program" required>
                  <Select
                    value={selectedProgram}
                    onChange={e => setSelectedProgram(e.target.value)}
                  >
                    <option value="">Select program…</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Meeting title" required>
                  <Input
                    value={meetingTitle}
                    onChange={e => setMeetingTitle(e.target.value)}
                    placeholder="Weekly sync — Apr 16"
                  />
                </Field>

                <Field label="Attendees" hint="Comma separated">
                  <Input
                    value={attendees}
                    onChange={e => setAttendees(e.target.value)}
                    placeholder="Alex, Priya, Sam"
                    leftIcon={<Users size={14} />}
                  />
                </Field>

                <div className="flex items-end">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    leftIcon={<Mic size={16} />}
                    onClick={startRecording}
                    disabled={!canStart}
                  >
                    Start recording
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Meetings list */}
        <Card padding="none">
          <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
                Meeting history
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
                {filteredMeetings.length} shown · {meetings.length} total
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search…"
                leftIcon={<Search size={14} />}
                compact
                className="w-56"
              />
              <Select
                value={filterProgram}
                onChange={e => setFilterProgram(e.target.value)}
                compact
              >
                <option value="all">All programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FileAudio size={24} />}
                title="No meetings found"
                description={
                  meetings.length === 0
                    ? 'Record your first meeting or upload audio to get started.'
                    : 'Try adjusting your filters or search query.'
                }
                accent="coral"
              />
            </div>
          ) : (
            <div>
              {filteredMeetings.map((meeting, idx) => {
                const program = programs.find(p => p.id === meeting.program_id);
                const tone = STATUS_TONE[meeting.status] || 'neutral';
                return (
                  <div
                    key={meeting.id}
                    className="px-5 py-4 transition-colors"
                    style={{
                      borderBottom: idx === filteredMeetings.length - 1 ? 'none' : '1px solid var(--border)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>
                            {meeting.title}
                          </h3>
                          <Chip tone={tone} size="xs" icon={getStatusIcon(meeting.status)}>
                            {meeting.status}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs flex-wrap" style={{ color: 'var(--ink-tertiary)' }}>
                          {program && (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: 'var(--coral-solid)' }}
                              />
                              {program.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {new Date(meeting.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {Math.floor(meeting.duration_seconds / 60)} min
                          </span>
                          {meeting.attendees.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users size={11} /> {meeting.attendees.length}
                            </span>
                          )}
                        </div>

                        {meeting.summary && (
                          <p className="mt-2 text-sm clamp-2" style={{ color: 'var(--ink-secondary)' }}>
                            {meeting.summary}
                          </p>
                        )}

                        {meeting.attendees.length > 0 && (
                          <div className="flex items-center gap-1 mt-3">
                            {meeting.attendees.slice(0, 5).map((name, i) => (
                              <Avatar key={i} name={name} size={24} />
                            ))}
                            {meeting.attendees.length > 5 && (
                              <span
                                className="ml-1 text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--bg-subtle)', color: 'var(--ink-tertiary)' }}
                              >
                                +{meeting.attendees.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {meeting.recording_url && (
                          <a
                            href={meeting.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg flex items-center justify-center focus-ring transition-colors"
                            style={{
                              border: '1px solid var(--border)',
                              color: 'var(--ink-secondary)',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--bg-subtle)';
                              e.currentTarget.style.color = 'var(--coral-ink)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--ink-secondary)';
                            }}
                            title="Play recording"
                          >
                            <Play size={14} />
                          </a>
                        )}
                        <a
                          href={`/meeting/${meeting.id}`}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm font-medium focus-ring transition-colors"
                          style={{
                            background: 'var(--coral-soft)',
                            color: 'var(--coral-ink)',
                          }}
                        >
                          View
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
