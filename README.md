# LPMO Command Center

A full-featured Launch Program Management Office (LPMO) Command Center — a single-pane-of-glass dashboard for managing multiple concurrent program launches.

## Features

### Phase 1-2: Core Structure ✅
- Dashboard with program cards, RAG status, launch countdowns
- Program CRUD with workstreams and task management
- Bandwidth Tracker with capacity visualization and 1:1 export
- Weekly 1:1 Tracker view

### Phase 3: Launch Readiness ✅
- Launch checklist template management in Settings
- Per-program checklist cloning and customization
- Gate timeline visualization with auto-calculated dates
- Gate status integration across the app

### Phase 4: Document Hub ✅
- Per-program document link repository
- Doc type icons and filtering
- Pinned documents support

### Phase 5: Meeting Intelligence 🚧
- In-browser recording with Web Audio API
- Meetings Hub with search and filtering
- Meeting status tracking (recording → transcribing → processing → ready)
- *Backend integration needed*: Whisper transcription, Claude summarization

### Phase 6: Program Brain (AI Query) ⏳
- RAG-powered chat interface per program
- Vector embeddings for meeting transcripts and status updates
- Source citation in responses

### Phase 7: AI Weekly Digest ⏳
- Portfolio-level weekly summary generation
- Markdown export and sharing
- Friday cron scheduling

### Phase 8: Polish ⏳
- AI pre-fill for status updates
- Global search + command palette
- Keyboard shortcuts
- Data export

## Tech Stack

- **Frontend**: React 18 + TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI Services**: OpenAI Whisper (transcription), Anthropic Claude (summarization + RAG)
- **Audio**: Web Audio API + MediaRecorder (in-browser recording)

## Getting Started

### 1. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Copy your Supabase URL and anon key

### 2. Configure Environment

Create `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── lib/                # Utilities and Supabase client
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── ProgramDetail.tsx
│   ├── BandwidthTracker.tsx
│   ├── WeeklyTracker.tsx
│   ├── WeeklyDigest.tsx
│   ├── MeetingsHub.tsx
│   └── Settings.tsx
└── types/              # TypeScript type definitions
```

## Database Schema

See `supabase-schema.sql` for the complete database schema including:
- Programs, Workstreams, Tasks
- Weekly Status reports
- Bandwidth Allocations
- Launch Checklist Templates & Instances
- Program Documents
- Meetings with AI metadata
- Weekly Digests
- Program Knowledge (vector-enabled for RAG)

## Next Steps

### Immediate (Phase 5 Completion)
1. Create Supabase Edge Functions for:
   - `transcribe-meeting`: Send audio to Whisper API
   - `summarize-meeting`: Send transcript to Claude for extraction
   - `embed-content`: Generate embeddings for RAG

2. Update MeetingsHub to trigger edge functions after recording upload

3. Create MeetingDetail page to view transcripts, summaries, and action items

### Short-term (Phases 6-7)
1. Enable pgvector extension in Supabase
2. Create program_knowledge table with vector column
3. Build ProgramBrainTab component with RAG query interface
4. Implement WeeklyDigest generation with Claude

### Long-term (Phase 8)
1. Add keyboard shortcuts
2. Implement global search with command palette
3. Build per-program data export (ZIP download)
4. Mobile optimization for recording widget

## Design Principles

- **Dark mode primary**: slate-900 backgrounds
- **Information density**: Linear meets Notion meets Bloomberg Terminal
- **Color palette**: 
  - Blue-500 for accents
  - Amber-400 for warnings
  - Emerald-400 for on-track status
  - Red-400 for blocked/at-risk
- **Typography**: Monospace for data, Inter for UI
- **No decorative gradients**: Sharp, professional, restrained

## License

MIT
