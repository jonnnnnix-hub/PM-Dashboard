import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function BandwidthTracker() {
  const { programs, currentWeek, setCurrentWeek, getWeekStart } = useApp();
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [focusNotes, setFocusNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const weekStart = getWeekStart(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4); // Friday

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  useEffect(() => {
    fetchData();
  }, [currentWeek]);

  const fetchData = async () => {
    setLoading(true);
    const weekStr = weekStart.toISOString().split('T')[0];

    // Fetch allocations
    const { data: allocData } = await supabase
      .from('bandwidth_allocations')
      .select('*')
      .eq('week_of', weekStr);

    // Fetch notes
    const { data: notesData } = await supabase
      .from('bandwidth_notes')
      .select('*')
      .eq('week_of', weekStr);

    if (allocData) {
      const allocMap: Record<string, number> = {};
      allocData.forEach(a => {
        allocMap[a.program_id] = a.percentage;
      });
      setAllocations(allocMap);
    }

    if (notesData && notesData.length > 0) {
      setFocusNotes(notesData[0].focus_notes || '');
    }

    setLoading(false);
  };

  const handleAllocationChange = (programId: string, percentage: number) => {
    setAllocations(prev => ({
      ...prev,
      [programId]: percentage,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const weekStr = weekStart.toISOString().split('T')[0];

    try {
      // Upsert allocations
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

      // Upsert notes
      if (focusNotes.trim()) {
        const { error: notesError } = await supabase
          .from('bandwidth_notes')
          .upsert({
            week_of: weekStr,
            focus_notes: focusNotes,
          }, { onConflict: 'week_of' });
        if (notesError) throw notesError;
      }
    } catch (error) {
      console.error('Error saving bandwidth:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateExport = () => {
    const sortedPrograms = programs
      .filter(p => allocations[p.id])
      .sort((a, b) => (allocations[b.id] || 0) - (allocations[a.id] || 0));

    let markdown = `## Bandwidth Allocation - ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}\n\n`;
    markdown += `**Total Utilization:** ${totalAllocation}%\n\n`;
    markdown += `### Allocations\n\n`;
    markdown += `| Program | Allocation |\n`;
    markdown += `|---------|------------|\n`;
    
    sortedPrograms.forEach(p => {
      markdown += `| ${p.name} (${p.codename}) | ${allocations[p.id]}% |\n`;
    });

    if (focusNotes.trim()) {
      markdown += `\n### Focus & Context\n\n${focusNotes}\n`;
    }

    return markdown;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateExport());
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeek(newDate);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-64"></div>
          <div className="h-32 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bandwidth Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your time allocation across programs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm rounded"
          >
            <Copy className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 hover:bg-slate-800 rounded"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="text-center">
          <div className="text-white font-medium">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {weekStart.toISOString().split('T')[0] === getWeekStart(new Date()).toISOString().split('T')[0] && 'Current Week'}
          </div>
        </div>
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 hover:bg-slate-800 rounded"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Capacity Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Total Utilization</span>
          <span className={`text-lg font-mono ${
            totalAllocation > 100 ? 'text-red-400' :
            totalAllocation > 90 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {totalAllocation}%
          </span>
        </div>
        <div className="h-8 bg-slate-800 rounded-full overflow-hidden flex">
          {programs.filter(p => allocations[p.id]).map((program, idx) => {
            const width = (allocations[program.id] || 0) / Math.max(totalAllocation, 1) * 100;
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'];
            return (
              <div
                key={program.id}
                className={`${colors[idx % colors.length]} transition-all`}
                style={{ width: `${width}%` }}
                title={`${program.name}: ${allocations[program.id]}%`}
              />
            );
          })}
        </div>
        {totalAllocation > 100 && (
          <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
            ⚠️ Over capacity by {totalAllocation - 100}%
          </div>
        )}
      </div>

      {/* Program Sliders */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-white">Program Allocations</h2>
        {programs.filter(p => p.status !== 'closed').map(program => (
          <div key={program.id} className="flex items-center gap-4">
            <div className="w-48 flex-shrink-0">
              <div className="text-sm text-white truncate">{program.name}</div>
              <div className="text-xs text-slate-400 font-mono">{program.codename}</div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={allocations[program.id] || 0}
              onChange={(e) => handleAllocationChange(program.id, parseInt(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <div className="w-16 text-right">
              <span className="text-sm font-mono text-white">{allocations[program.id] || 0}%</span>
            </div>
            <button
              onClick={() => handleAllocationChange(program.id, 0)}
              className="p-2 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Focus Notes */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Weekly Focus & Context</h2>
        <textarea
          value={focusNotes}
          onChange={(e) => setFocusNotes(e.target.value)}
          placeholder="What's driving your bandwidth this week? Any context for your manager..."
          rows={4}
          className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
