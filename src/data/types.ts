import type {
  Program,
  Workstream,
  Task,
  WeeklyStatus,
  BandwidthAllocation,
  BandwidthNote,
  Meeting,
  LaunchChecklist,
  LaunchChecklistTemplate,
  ProgramDocument,
  WeeklyDigest,
} from '@/types';

export interface DataService {
  getPrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | null>;
  upsertProgram(p: Partial<Program> & { id?: string }): Promise<Program>;
  deleteProgram(id: string): Promise<void>;

  getWorkstreams(programId: string): Promise<Workstream[]>;
  upsertWorkstream(w: Partial<Workstream> & { program_id: string }): Promise<Workstream>;
  deleteWorkstream(id: string): Promise<void>;

  getTasks(programId: string): Promise<Task[]>;
  upsertTask(t: Partial<Task> & { program_id: string; workstream_id: string }): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  getStatuses(programId: string): Promise<WeeklyStatus[]>;
  getStatusByWeek(programId: string, weekOf: string): Promise<WeeklyStatus | null>;
  getLatestStatus(programId: string): Promise<WeeklyStatus | null>;
  getAllLatestStatuses(): Promise<WeeklyStatus[]>;
  upsertStatus(s: Partial<WeeklyStatus> & { program_id: string }): Promise<WeeklyStatus>;

  getAllocations(weekOf: string): Promise<BandwidthAllocation[]>;
  getAllocationRange(startWeek: string, endWeek: string): Promise<BandwidthAllocation[]>;
  upsertAllocation(a: Partial<BandwidthAllocation> & { program_id: string; week_of: string }): Promise<BandwidthAllocation>;
  deleteAllocation(id: string): Promise<void>;
  getBandwidthNote(weekOf: string): Promise<BandwidthNote | null>;
  upsertBandwidthNote(n: Partial<BandwidthNote> & { week_of: string }): Promise<BandwidthNote>;

  getMeetings(programId?: string): Promise<Meeting[]>;
  getMeeting(id: string): Promise<Meeting | null>;
  upsertMeeting(m: Partial<Meeting> & { program_id: string }): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;

  getChecklist(programId: string): Promise<LaunchChecklist | null>;
  upsertChecklist(c: Partial<LaunchChecklist> & { program_id: string }): Promise<LaunchChecklist>;
  getTemplates(): Promise<LaunchChecklistTemplate[]>;
  upsertTemplate(t: Partial<LaunchChecklistTemplate>): Promise<LaunchChecklistTemplate>;
  deleteTemplate(id: string): Promise<void>;

  getDocuments(programId: string): Promise<ProgramDocument[]>;
  upsertDocument(d: Partial<ProgramDocument> & { program_id: string }): Promise<ProgramDocument>;
  deleteDocument(id: string): Promise<void>;

  getDigests(): Promise<WeeklyDigest[]>;
  getDigestByWeek(weekOf: string): Promise<WeeklyDigest | null>;
  upsertDigest(d: Partial<WeeklyDigest>): Promise<WeeklyDigest>;

  seedIfEmpty(): Promise<void>;
}
