import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import { FileText, Copy, Mail, RefreshCw, Calendar, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';
import type { WeeklyDigest } from '../types';

export default function WeeklyDigest() {
  const [digests, setDigests] = useState<WeeklyDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDigests();
  }, []);

  const fetchDigests = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_digests')
        .select('*')
        .order('week_of', { ascending: false });
      
      if (error) throw error;
      if (data) setDigests(data);
    } catch (error) {
      console.error('Error fetching digests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulated generation - would call edge function in production
    setTimeout(() => {
      setGenerating(false);
      alert('Digest generation triggered. In production, this would call the AI pipeline.');
    }, 2000);
  };

  const selectedDigest = digests.find(d => d.week_of.startsWith(selectedWeek));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-2">AI Weekly Digest</h1>
        <p className="text-slate-400">Portfolio-level weekly summaries powered by AI</p>
      </div>

      {/* Week Selector & Generate */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            <input
              type="week"
              value={selectedWeek.substring(0, 7)}
              onChange={(e) => setSelectedWeek(e.target.value + '-01')}
              className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          {selectedDigest && (
            <span className="text-xs px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded">
              Generated {formatDate(selectedDigest.generated_at)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded text-sm transition-colors"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'Generate Digest'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : selectedDigest ? (
        /* Rendered Digest */
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
              <Copy size={14} /> Copy to Clipboard
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
              <Mail size={14} /> Share via Email
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
              <RefreshCw size={14} /> Regenerate
            </button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {selectedDigest.source_data?.meeting_count || 0} meetings
            </span>
            <span className="flex items-center gap-1">
              <FileText size={12} /> {selectedDigest.source_data?.status_count || 0} status updates
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} /> {selectedDigest.source_data?.tasks_completed || 0} tasks completed
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={12} /> {selectedDigest.source_data?.programs_active || 0} active programs
            </span>
          </div>

          {/* Digest Content */}
          <div className="bg-slate-900/50 rounded border border-slate-800 p-6">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-slate-200 font-sans leading-relaxed">
                {selectedDigest.digest_markdown.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-xl font-semibold text-white mt-6 mb-3">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-lg font-medium text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 text-slate-300">{line.replace('- ', '')}</li>;
                  }
                  if (line.startsWith('**') && line.includes(':**')) {
                    const parts = line.split('**');
                    return (
                      <p key={i} className="text-slate-300 mt-2">
                        <strong>{parts[1]}</strong>{parts[2]}
                      </p>
                    );
                  }
                  if (line.trim() === '') {
                    return <br key={i} />;
                  }
                  return <p key={i} className="text-slate-300">{line}</p>;
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Digest State */
        <div className="text-center py-12 bg-slate-900/50 rounded border border-slate-800">
          <FileText size={64} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-medium text-white mb-2">No Digest for This Week</h3>
          <p className="text-slate-400 mb-4 max-w-md mx-auto">
            Generate an AI-powered weekly digest that synthesizes all program statuses, meetings, 
            completed tasks, and launch readiness into a single executive brief.
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Generate Now
          </button>
          
          <div className="mt-8 text-left max-w-lg mx-auto">
            <h4 className="text-sm font-medium text-slate-400 mb-3">The digest will include:</h4>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                Portfolio Pulse - overall health and bandwidth utilization
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                Program-by-program highlights with RAG status and launch readiness
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                Aggregated action items, blockers, and decisions
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                Recommended 1:1 discussion topics for your manager meeting
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Past Digests */}
      {digests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Digests</h3>
          <div className="grid grid-cols-3 gap-3">
            {digests.slice(0, 6).map(digest => (
              <button
                key={digest.id}
                onClick={() => setSelectedWeek(digest.week_of)}
                className={`p-3 rounded border text-left transition-colors ${
                  selectedDigest?.id === digest.id
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="text-sm font-medium text-white">
                  Week of {formatDate(digest.week_of)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Generated {formatDate(digest.generated_at)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
