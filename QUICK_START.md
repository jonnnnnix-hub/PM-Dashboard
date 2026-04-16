# 🚀 Quick Start Guide

## Deploy in 15 Minutes

### 1. Set Up Supabase (5 min)
```
1. Go to supabase.com → New Project
2. Name: "lpmo-command-center"
3. Save your project URL and anon key
4. Go to SQL Editor → Paste contents of supabase/supabase-schema.sql → Run
5. Go to Database → Extensions → Enable "vector"
```

### 2. Configure Environment (2 min)
Create `.env` file:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

### 3. Deploy Edge Functions (5 min)
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy transcribe-meeting
supabase functions deploy summarize-meeting
supabase functions deploy generate-embeddings
supabase functions deploy generate-digest
```

### 4. Deploy Frontend (3 min)
```bash
npm install -g vercel
vercel --prod
```

**Done!** Your LPMO Command Center is live.

---

## Test It Out

1. **Sign up** with your email
2. **Create a program** from the Dashboard
3. **Set bandwidth** allocation in Bandwidth Tracker
4. **Record a meeting** (click Record Meeting button)
5. **Ask Program Brain** a question about your meeting

---

## Next Steps

- Read [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md) for detailed deployment options
- See [README.md](./README.md) for feature overview
- Check [PULL_REQUEST.md](./PULL_REQUEST.md) for what's been built

**Need help?** See troubleshooting section in DEPLOY_INSTRUCTIONS.md
