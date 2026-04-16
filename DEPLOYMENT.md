# LPMO Command Center - Deployment Checklist

## ✅ Build Status
- **Build**: ✅ Successful (512KB bundle, 2.66s)
- **TypeScript**: ✅ No errors
- **All Phases (1-8)**: ✅ Complete

---

## 📋 Pre-Deployment Checklist

### 1. Supabase Setup (Required)
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Copy project URL and anon key from Settings → API
- [ ] Run `supabase-schema.sql` in SQL Editor
  - Creates all 13 tables with proper relationships
  - Enables pgvector extension for RAG
  - Seeds default launch checklist templates
  - Sets up Row Level Security policies
- [ ] Enable pgvector extension (already in schema):
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- [ ] Create Storage bucket named `recordings` for meeting audio files
  - Set to public access or signed URLs

### 2. Environment Configuration
Create `.env` file in project root:

```bash
# Required - Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Required for AI features (Phases 5-7)
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

**Note**: App works without AI keys using mock data, but transcription/summarization/RAG won't function.

### 3. Deploy Edge Functions (For AI Features)

Install Supabase CLI:
```bash
npm install -g supabase
```

Login and link project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy all four functions:
```bash
supabase functions deploy transcribe-meeting
supabase functions deploy summarize-meeting
supabase functions deploy generate-embeddings
supabase functions deploy generate-digest
```

Set environment variables in Supabase Dashboard:
- Go to Project Settings → Edge Functions
- Add:
  - `OPENAI_API_KEY` = your OpenAI key
  - `ANTHROPIC_API_KEY` = your Anthropic key

---

## 🚀 Deployment Options

### Option A: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_OPENAI_API_KEY
   - VITE_ANTHROPIC_API_KEY

4. For production:
   ```bash
   vercel --prod
   ```

### Option B: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. Set environment variables in Netlify dashboard

### Option C: Cloudflare Pages

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Deploy:
   ```bash
   wrangler pages deploy dist
   ```

### Option D: Self-Hosted

1. Build:
   ```bash
   npm run build
   ```

2. Serve `dist/` folder with any static file server:
   ```bash
   npx serve dist
   # or
   npx http-server dist
   ```

---

## 🧪 Testing Checklist

### Core Features (Work Without API Keys)
- [ ] Dashboard loads with program cards
- [ ] Create new program via "+" button
- [ ] Edit program details
- [ ] Add/edit/delete workstreams
- [ ] Task board: create, drag-and-drop, complete tasks
- [ ] Bandwidth Tracker: adjust sliders, navigate weeks
- [ ] Export bandwidth as markdown
- [ ] Weekly 1:1 Tracker view
- [ ] Launch Readiness tab with checklist
- [ ] Documents tab: add/edit links
- [ ] Settings: view/edit templates

### AI Features (Require API Keys + Edge Functions)
- [ ] Record meeting (click "Record Meeting" button)
- [ ] Stop recording and upload
- [ ] Meeting status shows "transcribing" → "processing" → "ready"
- [ ] View transcript in Meeting Detail
- [ ] View AI-generated summary, key points, action items
- [ ] Convert action item to task
- [ ] Program Brain: ask questions about the program
- [ ] Generate Weekly Digest
- [ ] AI pre-fill for weekly status updates

---

## 📊 Database Schema Verification

After running `supabase-schema.sql`, verify these tables exist:

| Table | Purpose |
|-------|---------|
| `programs` | Top-level program entities |
| `workstreams` | Sub-tracks within programs |
| `tasks` | Action items under workstreams |
| `weekly_status` | Weekly 1:1 reports |
| `bandwidth_allocations` | Per-program time allocation |
| `bandwidth_notes` | Weekly focus context |
| `launch_checklist_templates` | Master templates by program type |
| `launch_checklists` | Per-program checklist instances |
| `program_documents` | Linked document repository |
| `meetings` | Meeting metadata + AI results |
| `weekly_digests` | AI-generated weekly summaries |
| `program_knowledge` | Vector embeddings for RAG |

Verify seed data:
```sql
SELECT * FROM launch_checklist_templates;
-- Should return 3 templates: migration, price-increase, market-rollout
```

---

## 🔧 Troubleshooting

### "Failed to fetch" errors
- Check Supabase URL and key in `.env`
- Verify schema was created successfully
- Check browser console for CORS issues

### AI features not working
- Verify API keys have credits/billing enabled
- Check Edge Function logs in Supabase Dashboard
- Test Edge Functions locally first:
  ```bash
  supabase functions serve transcribe-meeting --env-file .env
  ```

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Vector search not working
- Confirm pgvector extension is enabled:
  ```sql
  SELECT * FROM pg_extension WHERE ext_name = 'vector';
  ```
- Check `program_knowledge` table has `embedding` column of type `vector(1536)`

---

## 📈 Post-Deployment

### Monitoring
- Set up Supabase query monitoring
- Monitor Edge Function invocations and errors
- Track API usage (OpenAI, Anthropic) for cost management

### Scheduled Tasks (Optional)
Set up Friday cron job for automatic digest generation:

In Supabase Dashboard → Database → Cron:
```sql
-- Create a scheduled job that runs every Friday at 4 PM
select cron.schedule(
  'friday-digest',
  '0 16 * * 5',
  $$
  select supabase_functions.invoke(
    'generate-digest',
    json_build_object('week_of', date_trunc('week', current_date))
  )
  $$
);
```

### Backup Strategy
- Enable daily backups in Supabase
- Export critical data weekly using Supabase CSV export
- Consider exporting per-program ZIP files (Phase 8 feature)

---

## 🎯 Quick Start Commands

```bash
# Local development
npm install
npm run dev

# Production build
npm run build

# Deploy to Vercel
vercel

# Deploy Edge Functions
supabase functions deploy transcribe-meeting
supabase functions deploy summarize-meeting
supabase functions deploy generate-embeddings
supabase functions deploy generate-digest
```

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **pgvector**: https://github.com/pgvector/pgvector
- **OpenAI Whisper**: https://platform.openai.com/docs/guides/speech-to-text
- **Anthropic Claude**: https://docs.anthropic.com/claude/docs

---

**Last Updated**: April 2025  
**Build Version**: 1.0.0  
**Bundle Size**: 512KB (gzipped: 140KB)
