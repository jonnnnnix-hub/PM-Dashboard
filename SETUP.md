# LPMO Command Center - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- OpenAI API key (for Whisper transcription and embeddings)
- Anthropic API key (for Claude summarization and RAG queries)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Note your project URL and anon key from Settings → API

## Step 2: Set Up Database Schema

1. In your Supabase project, go to SQL Editor
2. Copy the entire contents of `supabase-schema.sql` from this repo
3. Paste into the SQL Editor and run it
4. This creates all tables, enums, indexes, and seed data

## Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

## Step 6: Enable Row Level Security (Optional for Single User)

For production multi-user deployments, enable RLS on all tables:

```sql
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
-- Repeat for all tables...
```

Then create policies scoped to authenticated users.

## AI Features Setup

### Transcription Pipeline

Create a Supabase Edge Function for transcription:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-ref`
4. Create function: `supabase functions new transcribe-meeting`
5. Deploy: `supabase functions deploy transcribe-meeting`

See `edge-functions/transcribe-meeting/index.ts` for implementation.

### Embedding Pipeline

Similarly, create an edge function for generating embeddings and storing in `program_knowledge` table.

## Testing Without API Keys

The app works with mock data if API keys are not provided. You can:
- Navigate all pages
- Create/edit/delete programs, workstreams, tasks
- Manage bandwidth allocations
- View launch checklists
- Add document links

AI features (transcription, summarization, RAG queries, weekly digest) require valid API keys.

## Deployment

Build for production:

```bash
npm run build
```

Deploy the `dist` folder to:
- Vercel
- Netlify
- Cloudflare Pages
- Your own hosting

Make sure environment variables are set in your hosting platform.

## Troubleshooting

### "Failed to fetch" errors
- Check that Supabase URL and key are correct
- Ensure database schema is properly created

### AI features not working
- Verify API keys are valid and have credits
- Check browser console for CORS errors
- For production, use Edge Functions instead of client-side API calls

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript version: `npx tsc --version`
