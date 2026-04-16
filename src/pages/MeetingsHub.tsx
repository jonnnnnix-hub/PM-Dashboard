import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mic, Square, Play, CheckCircle, AlertCircle, 
  Loader2, FileAudio, ExternalLink
} from 'lucide-react';
import type { Meeting } from '../types';

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
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Create meeting record
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
          created_at: new Date().toISOString()
        };

        addMeeting(newMeeting);
        
        // Clean up
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

  const filteredMeetings = meetings.filter(meeting => {
    const matchesProgram = filterProgram === 'all' || meeting.program_id === filterProgram;
    const matchesSearch = searchQuery === '' || 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.transcript?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesProgram && matchesSearch;
  });

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'ready': return 'text-emerald-400';
      case 'processing': return 'text-blue-400';
      case 'transcribing': return 'text-amber-400';
      case 'recording': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: Meeting['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle size={16} />;
      case 'processing': return <Loader2 size={16} className="animate-spin" />;
      case 'transcribing': return <FileAudio size={16} />;
      case 'recording': return <Mic size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Meetings Hub</h1>
          <p className="text-slate-400">Record, transcribe, and manage all program meetings</p>
        </div>

        {/* Recording Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Record New Meeting</h2>
          
          {isRecording ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                  <Mic className="text-red-400" size={24} />
                </div>
                <div>
                  <p className="text-white font-medium">Recording in progress...</p>
                  <p className="text-slate-400 text-sm">{formatTime(recordingTime)}</p>
                </div>
              </div>
              
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Square size={18} /> Stop Recording
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Program *</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select program...</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g., Weekly Sync - 4/14"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Attendees</label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="Comma-separated names"
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={startRecording}
                  disabled={!selectedProgram || !meetingTitle}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded transition-colors"
                >
                  <Mic size={18} /> Start Recording
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Programs</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        {/* Meetings List */}
        <div className="space-y-3">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <FileAudio size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No meetings found</p>
            </div>
          ) : (
            filteredMeetings.map(meeting => {
              const program = programs.find(p => p.id === meeting.program_id);
              return (
                <div
                  key={meeting.id}
                  className="bg-slate-800/50 border border-slate-700 rounded p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={getStatusColor(meeting.status)}>
                          {getStatusIcon(meeting.status)}
                        </span>
                        <h3 className="text-white font-medium">{meeting.title}</h3>
                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded capitalize">
                          {meeting.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{program?.name}</span>
                        <span>•</span>
                        <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{Math.floor(meeting.duration_seconds / 60)} min</span>
                        {meeting.attendees.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{meeting.attendees.length} attendees</span>
                          </>
                        )}
                      </div>
                      
                      {meeting.summary && (
                        <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                          {meeting.summary}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={`/meeting/${meeting.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded transition-colors"
                      >
                        View Details
                        <ExternalLink size={14} />
                      </a>
                      {meeting.recording_url && (
                        <a
                          href={meeting.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        >
                          <Play size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
