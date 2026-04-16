import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Program, Meeting, LaunchChecklistTemplate, WeeklyStatus, BandwidthAllocation } from '../types';

interface AppContextType {
  programs: Program[];
  meetings: Meeting[];
  templates: LaunchChecklistTemplate[];
  weeklyStatuses: WeeklyStatus[];
  bandwidthAllocations: BandwidthAllocation[];
  loading: boolean;
  refreshPrograms: () => Promise<void>;
  addMeeting: (meeting: Meeting) => void;
  addTemplate: (template: LaunchChecklistTemplate) => void;
  updateTemplate: (id: string, template: Partial<LaunchChecklistTemplate>) => void;
  deleteTemplate: (id: string) => void;
  currentWeek: Date;
  setCurrentWeek: (date: Date) => void;
  getWeekStart: (date: Date) => Date;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [templates, setTemplates] = useState<LaunchChecklistTemplate[]>([]);
  const [_weeklyStatuses, _setWeeklyStatuses] = useState<WeeklyStatus[]>([]);
  const [_bandwidthAllocations, _setBandwidthAllocations] = useState<BandwidthAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const addMeeting = (meeting: Meeting) => {
    setMeetings(prev => [...prev, meeting]);
  };

  const addTemplate = (template: LaunchChecklistTemplate) => {
    setTemplates(prev => [...prev, template]);
  };

  const updateTemplate = (id: string, updates: Partial<LaunchChecklistTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const value = {
    programs,
    meetings,
    templates,
    weeklyStatuses: _weeklyStatuses,
    bandwidthAllocations: _bandwidthAllocations,
    loading,
    refreshPrograms: fetchPrograms,
    addMeeting,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    currentWeek,
    setCurrentWeek,
    getWeekStart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
