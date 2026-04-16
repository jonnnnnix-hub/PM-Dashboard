-- LPMO Command Center - Supabase Schema
-- Run this in your Supabase SQL Editor to create all tables, types, and RLS policies

-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Create custom enum types
CREATE TYPE program_type AS ENUM ('migration', 'price-increase', 'market-rollout', 'other');
CREATE TYPE program_status AS ENUM ('planning', 'in-flight', 'launched', 'closed');
CREATE TYPE workstream_status AS ENUM ('on-track', 'at-risk', 'blocked', 'complete');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'done', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE rag_status AS ENUM ('green', 'yellow', 'red');
CREATE TYPE doc_type AS ENUM ('runbook', 'deck', 'memo', 'comms-template', 'legal', 'data', 'design', 'other');
CREATE TYPE meeting_status AS ENUM ('recording', 'transcribing', 'processing', 'ready');
CREATE TYPE source_type AS ENUM ('transcript', 'summary', 'status-update', 'decision', 'checklist-note', 'manual-note');

-- Programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  codename TEXT NOT NULL,
  program_type program_type NOT NULL DEFAULT 'other',
  status program_status NOT NULL DEFAULT 'planning',
  launch_date DATE,
  owner TEXT,
  stakeholders TEXT[],
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workstreams table
CREATE TABLE workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  owner TEXT,
  status workstream_status NOT NULL DEFAULT 'on-track',
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workstream_id UUID REFERENCES workstreams ON DELETE CASCADE,
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  source_meeting_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Status table
CREATE TABLE weekly_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  week_of DATE NOT NULL,
  overall_rag rag_status NOT NULL DEFAULT 'green',
  summary TEXT,
  accomplishments JSONB DEFAULT '[]',
  next_steps JSONB DEFAULT '[]',
  risks_issues JSONB DEFAULT '[]',
  blockers JSONB DEFAULT '[]',
  decisions_needed JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, week_of)
);

-- Bandwidth Allocations table
CREATE TABLE bandwidth_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  week_of DATE NOT NULL,
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_of, program_id)
);

-- Bandwidth Notes table
CREATE TABLE bandwidth_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  week_of DATE NOT NULL,
  focus_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_of)
);

-- Launch Checklist Templates table
CREATE TABLE launch_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  program_type program_type NOT NULL,
  name TEXT NOT NULL,
  gates JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_type)
);

-- Launch Checklists table (per-program instances)
CREATE TABLE launch_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  template_id UUID REFERENCES launch_checklist_templates,
  gates JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id)
);

-- Program Documents table
CREATE TABLE program_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  doc_type doc_type NOT NULL DEFAULT 'other',
  description TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  attendees TEXT[],
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  summary TEXT,
  key_points JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  decisions JSONB DEFAULT '[]',
  embedding_ids TEXT[],
  status meeting_status NOT NULL DEFAULT 'recording',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Digests table
CREATE TABLE weekly_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  week_of DATE NOT NULL,
  digest_markdown TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  source_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_of)
);

-- Program Knowledge table (vector-enabled for RAG)
CREATE TABLE program_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL DEFAULT auth.uid(),
  meeting_id UUID REFERENCES meetings ON DELETE SET NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  source_type source_type NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON program_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security on all tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workstreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE bandwidth_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bandwidth_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see/edit their own data
CREATE POLICY "Users can view own programs" ON programs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own programs" ON programs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own programs" ON programs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own programs" ON programs FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own workstreams" ON workstreams FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own workstreams" ON workstreams FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own workstreams" ON workstreams FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own workstreams" ON workstreams FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own weekly_status" ON weekly_status FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own weekly_status" ON weekly_status FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own weekly_status" ON weekly_status FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own weekly_status" ON weekly_status FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own bandwidth_allocations" ON bandwidth_allocations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bandwidth_allocations" ON bandwidth_allocations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bandwidth_allocations" ON bandwidth_allocations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own bandwidth_allocations" ON bandwidth_allocations FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own bandwidth_notes" ON bandwidth_notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bandwidth_notes" ON bandwidth_notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bandwidth_notes" ON bandwidth_notes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own bandwidth_notes" ON bandwidth_notes FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own templates" ON launch_checklist_templates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own templates" ON launch_checklist_templates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own templates" ON launch_checklist_templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own templates" ON launch_checklist_templates FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own checklists" ON launch_checklists FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own checklists" ON launch_checklists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own checklists" ON launch_checklists FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own checklists" ON launch_checklists FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own documents" ON program_documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own documents" ON program_documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own documents" ON program_documents FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own documents" ON program_documents FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own meetings" ON meetings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own meetings" ON meetings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own meetings" ON meetings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own meetings" ON meetings FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own digests" ON weekly_digests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own digests" ON weekly_digests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own digests" ON weekly_digests FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own digests" ON weekly_digests FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own knowledge" ON program_knowledge FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own knowledge" ON program_knowledge FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own knowledge" ON program_knowledge FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own knowledge" ON program_knowledge FOR DELETE USING (user_id = auth.uid());

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workstreams_updated_at BEFORE UPDATE ON workstreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_status_updated_at BEFORE UPDATE ON weekly_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bandwidth_allocations_updated_at BEFORE UPDATE ON bandwidth_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_launch_checklists_updated_at BEFORE UPDATE ON launch_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_documents_updated_at BEFORE UPDATE ON program_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default launch checklist templates
INSERT INTO launch_checklist_templates (program_type, name, gates, user_id) VALUES
('migration', 'Migration Launch Template', '{
  "gates": [
    {
      "id": "t-30",
      "name": "T-30: Planning Complete",
      "target_offset_days": -30,
      "items": [
        {"id": "m1-1", "title": "Subscriber segmentation finalized", "owner_role": "Program Lead", "required": true},
        {"id": "m1-2", "title": "Migration tech plan approved", "owner_role": "Engineering", "required": true},
        {"id": "m1-3", "title": "Comms plan drafted", "owner_role": "Comms", "required": true},
        {"id": "m1-4", "title": "Legal/regulatory review initiated", "owner_role": "Legal", "required": true},
        {"id": "m1-5", "title": "CS training plan created", "owner_role": "Support", "required": true}
      ]
    },
    {
      "id": "t-14",
      "name": "T-14: Readiness Review",
      "target_offset_days": -14,
      "items": [
        {"id": "m2-1", "title": "Comms reviewed by legal", "owner_role": "Legal", "required": true},
        {"id": "m2-2", "title": "Tech dry run completed", "owner_role": "Engineering", "required": true},
        {"id": "m2-3", "title": "CS FAQs published", "owner_role": "Support", "required": true},
        {"id": "m2-4", "title": "Exec briefing deck drafted", "owner_role": "Program Lead", "required": true},
        {"id": "m2-5", "title": "Rollback plan documented", "owner_role": "Engineering", "required": true}
      ]
    },
    {
      "id": "t-7",
      "name": "T-7: Go/No-Go",
      "target_offset_days": -7,
      "items": [
        {"id": "m3-1", "title": "Go/No-Go meeting held", "owner_role": "Program Lead", "required": true},
        {"id": "m3-2", "title": "Final comms approved", "owner_role": "Comms", "required": true},
        {"id": "m3-3", "title": "Tech freeze in effect", "owner_role": "Engineering", "required": true},
        {"id": "m3-4", "title": "Exec briefing sent", "owner_role": "Program Lead", "required": true},
        {"id": "m3-5", "title": "War room logistics confirmed", "owner_role": "Operations", "required": true}
      ]
    },
    {
      "id": "t-1",
      "name": "T-1: Final Check",
      "target_offset_days": -1,
      "items": [
        {"id": "m4-1", "title": "Final subscriber count locked", "owner_role": "Data", "required": true},
        {"id": "m4-2", "title": "Comms scheduled/queued", "owner_role": "Comms", "required": true},
        {"id": "m4-3", "title": "On-call roster confirmed", "owner_role": "Engineering", "required": true},
        {"id": "m4-4", "title": "Monitoring dashboards verified", "owner_role": "Engineering", "required": true},
        {"id": "m4-5", "title": "Exec pre-read sent", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "launch",
      "name": "Launch Day",
      "target_offset_days": 0,
      "items": [
        {"id": "m5-1", "title": "Migration executed", "owner_role": "Engineering", "required": true},
        {"id": "m5-2", "title": "Comms deployed", "owner_role": "Comms", "required": true},
        {"id": "m5-3", "title": "Monitoring active", "owner_role": "Engineering", "required": true},
        {"id": "m5-4", "title": "Exec flash update sent", "owner_role": "Program Lead", "required": true},
        {"id": "m5-5", "title": "CS escalation path live", "owner_role": "Support", "required": true}
      ]
    },
    {
      "id": "post-launch",
      "name": "Post-Launch (+7)",
      "target_offset_days": 7,
      "items": [
        {"id": "m6-1", "title": "Migration success metrics reviewed", "owner_role": "Data", "required": true},
        {"id": "m6-2", "title": "Subscriber impact assessment", "owner_role": "Program Lead", "required": true},
        {"id": "m6-3", "title": "Issue log closed out", "owner_role": "Engineering", "required": true},
        {"id": "m6-4", "title": "Lessons learned captured", "owner_role": "Program Lead", "required": true},
        {"id": "m6-5", "title": "Final exec readout scheduled", "owner_role": "Program Lead", "required": true}
      ]
    }
  ]
}'::jsonb, auth.uid()),

('price-increase', 'Price Increase Template', '{
  "gates": [
    {
      "id": "t-30",
      "name": "T-30: Planning Complete",
      "target_offset_days": -30,
      "items": [
        {"id": "p1-1", "title": "Pricing approved by finance", "owner_role": "Finance", "required": true},
        {"id": "p1-2", "title": "Billing system changes scoped", "owner_role": "Engineering", "required": true},
        {"id": "p1-3", "title": "Comms strategy approved", "owner_role": "Comms", "required": true},
        {"id": "p1-4", "title": "Legal review of notification requirements", "owner_role": "Legal", "required": true},
        {"id": "p1-5", "title": "Grandfathering rules defined", "owner_role": "Product", "required": true}
      ]
    },
    {
      "id": "t-14",
      "name": "T-14: Readiness Review",
      "target_offset_days": -14,
      "items": [
        {"id": "p2-1", "title": "Billing system changes tested", "owner_role": "Engineering", "required": true},
        {"id": "p2-2", "title": "Customer notification copy finalized", "owner_role": "Comms", "required": true},
        {"id": "p2-3", "title": "CS scripts and FAQs ready", "owner_role": "Support", "required": true},
        {"id": "p2-4", "title": "Exec briefing drafted", "owner_role": "Program Lead", "required": true},
        {"id": "p2-5", "title": "Churn model reviewed", "owner_role": "Data", "required": true}
      ]
    },
    {
      "id": "t-7",
      "name": "T-7: Go/No-Go",
      "target_offset_days": -7,
      "items": [
        {"id": "p3-1", "title": "Go/No-Go", "owner_role": "Program Lead", "required": true},
        {"id": "p3-2", "title": "Notifications scheduled", "owner_role": "Comms", "required": true},
        {"id": "p3-3", "title": "Billing changes in staging", "owner_role": "Engineering", "required": true},
        {"id": "p3-4", "title": "Media/PR holding statement ready", "owner_role": "Comms", "required": true},
        {"id": "p3-5", "title": "Monitoring plan confirmed", "owner_role": "Data", "required": true}
      ]
    },
    {
      "id": "t-1",
      "name": "T-1: Final Check",
      "target_offset_days": -1,
      "items": [
        {"id": "p4-1", "title": "Final billing system validation", "owner_role": "Engineering", "required": true},
        {"id": "p4-2", "title": "Notifications queued", "owner_role": "Comms", "required": true},
        {"id": "p4-3", "title": "War room setup", "owner_role": "Operations", "required": true},
        {"id": "p4-4", "title": "Exec pre-read sent", "owner_role": "Program Lead", "required": true},
        {"id": "p4-5", "title": "Social monitoring active", "owner_role": "Comms", "required": true}
      ]
    },
    {
      "id": "launch",
      "name": "Launch Day",
      "target_offset_days": 0,
      "items": [
        {"id": "p5-1", "title": "Price change live", "owner_role": "Engineering", "required": true},
        {"id": "p5-2", "title": "Notifications sent", "owner_role": "Comms", "required": true},
        {"id": "p5-3", "title": "CS fully staffed", "owner_role": "Support", "required": true},
        {"id": "p5-4", "title": "Real-time churn monitoring", "owner_role": "Data", "required": true},
        {"id": "p5-5", "title": "Exec flash update", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "post-launch",
      "name": "Post-Launch (+7)",
      "target_offset_days": 7,
      "items": [
        {"id": "p6-1", "title": "Churn vs. forecast analysis", "owner_role": "Data", "required": true},
        {"id": "p6-2", "title": "CS volume assessment", "owner_role": "Support", "required": true},
        {"id": "p6-3", "title": "Revenue impact preliminary", "owner_role": "Finance", "required": true},
        {"id": "p6-4", "title": "Lessons learned", "owner_role": "Program Lead", "required": true},
        {"id": "p6-5", "title": "Exec readout", "owner_role": "Program Lead", "required": true}
      ]
    }
  ]
}'::jsonb, auth.uid()),

('market-rollout', 'Market Rollout Template', '{
  "gates": [
    {
      "id": "t-30",
      "name": "T-30: Planning Complete",
      "target_offset_days": -30,
      "items": [
        {"id": "r1-1", "title": "Market strategy finalized", "owner_role": "Strategy", "required": true},
        {"id": "r1-2", "title": "Content/catalog readiness", "owner_role": "Content", "required": true},
        {"id": "r1-3", "title": "Localization in progress", "owner_role": "Localization", "required": true},
        {"id": "r1-4", "title": "Payment methods integrated", "owner_role": "Engineering", "required": true},
        {"id": "r1-5", "title": "Marketing plan approved", "owner_role": "Marketing", "required": true}
      ]
    },
    {
      "id": "t-14",
      "name": "T-14: Readiness Review",
      "target_offset_days": -14,
      "items": [
        {"id": "r2-1", "title": "Localization QA complete", "owner_role": "QA", "required": true},
        {"id": "r2-2", "title": "App store listings ready", "owner_role": "Marketing", "required": true},
        {"id": "r2-3", "title": "Marketing assets finalized", "owner_role": "Marketing", "required": true},
        {"id": "r2-4", "title": "CS localized support ready", "owner_role": "Support", "required": true},
        {"id": "r2-5", "title": "Exec briefing drafted", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "t-7",
      "name": "T-7: Go/No-Go",
      "target_offset_days": -7,
      "items": [
        {"id": "r3-1", "title": "Go/No-Go", "owner_role": "Program Lead", "required": true},
        {"id": "r3-2", "title": "App store submissions", "owner_role": "Marketing", "required": true},
        {"id": "r3-3", "title": "Marketing campaigns scheduled", "owner_role": "Marketing", "required": true},
        {"id": "r3-4", "title": "Influencer/PR embargoed", "owner_role": "Comms", "required": true},
        {"id": "r3-5", "title": "Monitoring plan confirmed", "owner_role": "Data", "required": true}
      ]
    },
    {
      "id": "t-1",
      "name": "T-1: Final Check",
      "target_offset_days": -1,
      "items": [
        {"id": "r4-1", "title": "App store approvals confirmed", "owner_role": "Marketing", "required": true},
        {"id": "r4-2", "title": "Marketing go-live queued", "owner_role": "Marketing", "required": true},
        {"id": "r4-3", "title": "CS coverage confirmed", "owner_role": "Support", "required": true},
        {"id": "r4-4", "title": "Exec pre-read sent", "owner_role": "Program Lead", "required": true},
        {"id": "r4-5", "title": "Analytics tracking verified", "owner_role": "Data", "required": true}
      ]
    },
    {
      "id": "launch",
      "name": "Launch Day",
      "target_offset_days": 0,
      "items": [
        {"id": "r5-1", "title": "Service live in market", "owner_role": "Engineering", "required": true},
        {"id": "r5-2", "title": "Marketing campaigns active", "owner_role": "Marketing", "required": true},
        {"id": "r5-3", "title": "CS monitoring", "owner_role": "Support", "required": true},
        {"id": "r5-4", "title": "Real-time analytics", "owner_role": "Data", "required": true},
        {"id": "r5-5", "title": "Exec flash update", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "post-launch",
      "name": "Post-Launch (+7)",
      "target_offset_days": 7,
      "items": [
        {"id": "r6-1", "title": "Subscriber acquisition vs. forecast", "owner_role": "Data", "required": true},
        {"id": "r6-2", "title": "Market-specific issues review", "owner_role": "Program Lead", "required": true},
        {"id": "r6-3", "title": "Content performance", "owner_role": "Content", "required": true},
        {"id": "r6-4", "title": "Lessons learned", "owner_role": "Program Lead", "required": true},
        {"id": "r6-5", "title": "Exec readout", "owner_role": "Program Lead", "required": true}
      ]
    }
  ]
}'::jsonb, auth.uid()),

('other', 'Generic Launch Template', '{
  "gates": [
    {
      "id": "t-30",
      "name": "T-30: Planning Complete",
      "target_offset_days": -30,
      "items": [
        {"id": "g1-1", "title": "Project scope defined", "owner_role": "Program Lead", "required": true},
        {"id": "g1-2", "title": "Key stakeholders identified", "owner_role": "Program Lead", "required": true},
        {"id": "g1-3", "title": "Initial timeline established", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "t-14",
      "name": "T-14: Readiness Review",
      "target_offset_days": -14,
      "items": [
        {"id": "g2-1", "title": "Execution plan finalized", "owner_role": "Program Lead", "required": true},
        {"id": "g2-2", "title": "Resources allocated", "owner_role": "Program Lead", "required": true},
        {"id": "g2-3", "title": "Risks identified and mitigated", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "t-7",
      "name": "T-7: Go/No-Go",
      "target_offset_days": -7,
      "items": [
        {"id": "g3-1", "title": "Go/No-Go decision made", "owner_role": "Program Lead", "required": true},
        {"id": "g3-2", "title": "Team ready for execution", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "t-1",
      "name": "T-1: Final Check",
      "target_offset_days": -1,
      "items": [
        {"id": "g4-1", "title": "Final preparations complete", "owner_role": "Program Lead", "required": true},
        {"id": "g4-2", "title": "Communication sent", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "launch",
      "name": "Launch Day",
      "target_offset_days": 0,
      "items": [
        {"id": "g5-1", "title": "Launch executed", "owner_role": "Program Lead", "required": true},
        {"id": "g5-2", "title": "Monitoring active", "owner_role": "Program Lead", "required": true}
      ]
    },
    {
      "id": "post-launch",
      "name": "Post-Launch (+7)",
      "target_offset_days": 7,
      "items": [
        {"id": "g6-1", "title": "Results reviewed", "owner_role": "Program Lead", "required": true},
        {"id": "g6-2", "title": "Lessons learned captured", "owner_role": "Program Lead", "required": true}
      ]
    }
  ]
}'::jsonb, auth.uid())

ON CONFLICT (program_type) DO NOTHING;
