-- PM Dashboard Core Schema
-- Phase 1: Programs, Workstreams, Tasks, Weekly Status

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-----------------------------------------------------
-- PROGRAMS
-----------------------------------------------------
create table programs (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  codename    text not null default '',
  program_type text not null check (program_type in ('migration','price-increase','market-rollout','other')),
  status      text not null default 'planning' check (status in ('planning','in-flight','launched','closed')),
  launch_date date,
  owner       text not null default '',
  stakeholders text[] not null default '{}',
  description text not null default '',
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table programs enable row level security;
create policy "Allow all for authenticated users" on programs
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- WORKSTREAMS
-----------------------------------------------------
create table workstreams (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references programs(id) on delete cascade,
  name        text not null,
  owner       text not null default '',
  status      text not null default 'on-track' check (status in ('on-track','at-risk','blocked','complete')),
  notes       text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_workstreams_program on workstreams(program_id);

alter table workstreams enable row level security;
create policy "Allow all for authenticated users" on workstreams
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- TASKS
-----------------------------------------------------
create table tasks (
  id                uuid primary key default uuid_generate_v4(),
  workstream_id     uuid references workstreams(id) on delete set null,
  program_id        uuid not null references programs(id) on delete cascade,
  title             text not null,
  description       text not null default '',
  assignee          text not null default '',
  status            text not null default 'todo' check (status in ('todo','in-progress','done','blocked')),
  priority          text not null default 'medium' check (priority in ('low','medium','high','critical')),
  due_date          date,
  completed_at      timestamptz,
  source_meeting_id uuid,
  created_at        timestamptz not null default now()
);

create index idx_tasks_program on tasks(program_id);
create index idx_tasks_workstream on tasks(workstream_id);
create index idx_tasks_status on tasks(status);

alter table tasks enable row level security;
create policy "Allow all for authenticated users" on tasks
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- WEEKLY STATUS
-----------------------------------------------------
create table weekly_status (
  id              uuid primary key default uuid_generate_v4(),
  program_id      uuid not null references programs(id) on delete cascade,
  week_of         date not null,
  overall_rag     text not null default 'green' check (overall_rag in ('green','yellow','red')),
  summary         text not null default '',
  accomplishments text[] not null default '{}',
  next_steps      text[] not null default '{}',
  risks_issues    jsonb not null default '[]',
  blockers        jsonb not null default '[]',
  decisions_needed text[] not null default '{}',
  notes           text not null default '',
  created_at      timestamptz not null default now(),
  unique(program_id, week_of)
);

create index idx_weekly_status_program on weekly_status(program_id);

alter table weekly_status enable row level security;
create policy "Allow all for authenticated users" on weekly_status
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- BANDWIDTH ALLOCATIONS
-----------------------------------------------------
create table bandwidth_allocations (
  id          uuid primary key default uuid_generate_v4(),
  week_of     date not null,
  program_id  uuid not null references programs(id) on delete cascade,
  percentage  int not null default 0 check (percentage >= 0 and percentage <= 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(week_of, program_id)
);

alter table bandwidth_allocations enable row level security;
create policy "Allow all for authenticated users" on bandwidth_allocations
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- BANDWIDTH NOTES
-----------------------------------------------------
create table bandwidth_notes (
  id          uuid primary key default uuid_generate_v4(),
  week_of     date not null unique,
  focus_notes text not null default '',
  created_at  timestamptz not null default now()
);

alter table bandwidth_notes enable row level security;
create policy "Allow all for authenticated users" on bandwidth_notes
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- LAUNCH CHECKLIST TEMPLATES
-----------------------------------------------------
create table launch_checklist_templates (
  id            uuid primary key default uuid_generate_v4(),
  program_type  text not null check (program_type in ('migration','price-increase','market-rollout','other')),
  name          text not null,
  gates         jsonb not null default '[]',
  created_at    timestamptz not null default now()
);

alter table launch_checklist_templates enable row level security;
create policy "Allow all for authenticated users" on launch_checklist_templates
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- LAUNCH CHECKLISTS
-----------------------------------------------------
create table launch_checklists (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references programs(id) on delete cascade,
  template_id uuid references launch_checklist_templates(id) on delete set null,
  gates       jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_launch_checklists_program on launch_checklists(program_id);

alter table launch_checklists enable row level security;
create policy "Allow all for authenticated users" on launch_checklists
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- PROGRAM DOCUMENTS
-----------------------------------------------------
create table program_documents (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references programs(id) on delete cascade,
  title       text not null,
  url         text not null,
  doc_type    text not null default 'other' check (doc_type in ('runbook','deck','memo','comms-template','legal','data','design','other')),
  description text not null default '',
  pinned      boolean not null default false,
  added_by    text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_program_documents_program on program_documents(program_id);

alter table program_documents enable row level security;
create policy "Allow all for authenticated users" on program_documents
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- MEETINGS
-----------------------------------------------------
create table meetings (
  id                uuid primary key default uuid_generate_v4(),
  program_id        uuid not null references programs(id) on delete cascade,
  title             text not null,
  date              timestamptz not null default now(),
  attendees         text[] not null default '{}',
  duration_seconds  int not null default 0,
  recording_url     text not null default '',
  transcript        text not null default '',
  summary           text not null default '',
  key_points        text[] not null default '{}',
  action_items      jsonb not null default '[]',
  decisions         jsonb not null default '[]',
  embedding_ids     text[] not null default '{}',
  status            text not null default 'recording' check (status in ('recording','transcribing','processing','ready')),
  created_at        timestamptz not null default now()
);

create index idx_meetings_program on meetings(program_id);

alter table meetings enable row level security;
create policy "Allow all for authenticated users" on meetings
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- WEEKLY DIGESTS
-----------------------------------------------------
create table weekly_digests (
  id              uuid primary key default uuid_generate_v4(),
  week_of         date not null unique,
  digest_markdown text not null default '',
  generated_at    timestamptz not null default now(),
  source_data     jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

alter table weekly_digests enable row level security;
create policy "Allow all for authenticated users" on weekly_digests
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- PROGRAM KNOWLEDGE (for RAG — Phase 6)
-----------------------------------------------------
-- pgvector extension will be enabled in Phase 6
-- create extension if not exists vector;

create table program_knowledge (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references programs(id) on delete cascade,
  meeting_id  uuid references meetings(id) on delete set null,
  content     text not null,
  -- embedding   vector(1536),  -- enabled in Phase 6
  source_type text not null check (source_type in ('transcript','summary','status_update','decision','checklist_note','manual_note')),
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index idx_program_knowledge_program on program_knowledge(program_id);

alter table program_knowledge enable row level security;
create policy "Allow all for authenticated users" on program_knowledge
  for all using (auth.role() = 'authenticated');

-----------------------------------------------------
-- Updated_at trigger function
-----------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_programs_updated_at before update on programs
  for each row execute function set_updated_at();

create trigger trg_bandwidth_allocations_updated_at before update on bandwidth_allocations
  for each row execute function set_updated_at();

create trigger trg_launch_checklists_updated_at before update on launch_checklists
  for each row execute function set_updated_at();

create trigger trg_program_documents_updated_at before update on program_documents
  for each row execute function set_updated_at();
