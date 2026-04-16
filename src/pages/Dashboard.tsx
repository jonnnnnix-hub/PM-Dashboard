import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ProgramCard } from '../components/ProgramCard';
import { NewProgramModal } from '../components/NewProgramModal';
import type { Program } from '../types';

interface DashboardProgram extends Program {
  latest_rag?: 'green' | 'yellow' | 'red';
  latest_summary?: string;
  gate_progress?: { current_gate: string; completed: number; total: number };
  unreviewed_meetings?: number;
  overdue_gate?: boolean;
}

export default function Dashboard() {
  const { programs, loading, refreshPrograms } = useApp();
  const [dashboardPrograms, setDashboardPrograms] = useState<DashboardProgram[]>([]);
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [stats, setStats] = useState({
    totalUtilization: 0,
    pendingStatuses: 0,
    openActions: 0,
    recentMeetings: 0,
  });

  const fetchDashboardData = async () => {
    if (!programs.length) return;

    const programIds = programs.map(p => p.id);
    
    // Fetch latest weekly statuses
    const { data: statuses } = await supabase
      .from('weekly_status')
      .select('*')
      .in('program_id', programIds);

    // Fetch meetings
    const { data: meetings } = await supabase
      .from('meetings')
      .select('*')
      .in('program_id', programIds)
      .eq('status', 'ready');

    // Fetch launch checklists
    const { data: checklists } = await supabase
      .from('launch_checklists')
      .select('*')
      .in('program_id', programIds);

    // Fetch bandwidth for current week
    const weekStart = new Date();
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const { data: bandwidth } = await supabase
      .from('bandwidth_allocations')
      .select('percentage')
      .eq('week_of', weekStart.toISOString().split('T')[0]);

    // Enrich programs with data
    const enriched = programs.map(program => {
      const programStatuses = statuses?.filter(s => s.program_id === program.id) || [];
      const latestStatus = programStatuses.sort((a, b) => 
        new Date(b.week_of).getTime() - new Date(a.week_of).getTime()
      )[0];

      const programMeetings = meetings?.filter(m => m.program_id === program.id) || [];
      const unreviewedCount = programMeetings.length;

      const checklist = checklists?.find(c => c.program_id === program.id);
      let gateProgress;
      let overdueGate = false;

      if (checklist && checklist.gates) {
        const now = new Date();
        const launchDate = new Date(program.launch_date);
        
        // Find current gate
        const gatesWithDates = checklist.gates.map((gate: any) => ({
          ...gate,
          targetDate: new Date(launchDate.getTime() + gate.target_offset_days * 24 * 60 * 60 * 1000),
        }));

        const currentGate = gatesWithDates.find((g: any) => g.targetDate >= now) || gatesWithDates[gatesWithDates.length - 1];
        
        if (currentGate) {
          const completed = currentGate.items.filter((i: any) => i.status === 'complete').length;
          const total = currentGate.items.filter((i: any) => i.required).length;
          
          gateProgress = {
            current_gate: currentGate.name,
            completed,
            total,
          };

          // Check if overdue
          const targetDate = new Date(launchDate.getTime() + currentGate.target_offset_days * 24 * 60 * 60 * 1000);
          if (targetDate < now && completed < total) {
            overdueGate = true;
          }
        }
      }

      return {
        ...program,
        latest_rag: latestStatus?.overall_rag,
        latest_summary: latestStatus?.summary,
        gate_progress: gateProgress,
        unreviewed_meetings: unreviewedCount,
        overdue_gate: overdueGate,
      };
    });

    setDashboardPrograms(enriched);

    // Calculate stats
    const totalUtil = bandwidth?.reduce((sum, b) => sum + b.percentage, 0) || 0;
    const currentWeekStart = weekStart.toISOString().split('T')[0];
    const pendingStatusCount = programs.filter(p => {
      const hasStatusThisWeek = statuses?.some(s => 
        s.program_id === p.id && s.week_of.startsWith(currentWeekStart.substring(0, 10))
      );
      return !hasStatusThisWeek;
    }).length;

    setStats({
      totalUtilization: totalUtil,
      pendingStatuses: pendingStatusCount,
      openActions: 0, // TODO: fetch from tasks
      recentMeetings: meetings?.length || 0,
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [programs]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-48"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowNewProgram(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
        >
          <Plus className="w-4 h-4" />
          New Program
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            Bandwidth This Week
          </div>
          <div className={`text-2xl font-mono ${
            stats.totalUtilization > 100 ? 'text-red-400' :
            stats.totalUtilization > 90 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {stats.totalUtilization}%
          </div>
          {stats.totalUtilization > 100 && (
            <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Over capacity
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <FileText className="w-3.5 h-3.5" />
            Pending Status Updates
          </div>
          <div className={`text-2xl font-mono ${
            stats.pendingStatuses > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {stats.pendingStatuses}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Open Action Items
          </div>
          <div className="text-2xl font-mono text-slate-200">
            {stats.openActions}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <FileText className="w-3.5 h-3.5" />
            Recent Meetings
          </div>
          <div className="text-2xl font-mono text-slate-200">
            {stats.recentMeetings}
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Active Programs</h2>
        {dashboardPrograms.filter(p => p.status !== 'closed').length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400 mb-4">No active programs yet</p>
            <button
              onClick={() => setShowNewProgram(true)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Create your first program →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardPrograms.filter(p => p.status !== 'closed').map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>

      {/* Closed Programs */}
      {dashboardPrograms.filter(p => p.status === 'closed').length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Closed Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardPrograms.filter(p => p.status === 'closed').map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      )}

      <NewProgramModal
        isOpen={showNewProgram}
        onClose={() => setShowNewProgram(false)}
        onSuccess={() => {
          refreshPrograms();
        }}
      />
    </div>
  );
}
