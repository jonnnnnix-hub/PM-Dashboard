# 🚀 LPMO Command Center - Deployment Instructions

## ✅ Build Status: COMPLETE
Production build successful at `/workspace/dist/`
- Bundle size: 512KB (140KB gzipped)
- All TypeScript compilation passed
- Ready for deployment

---

## 📋 Deployment Checklist

### Step 1: Set Up Supabase Database

1. **Create a new project** at [supabase.com](https://supabase.com)
   - Choose organization and project name (e.g., "lpmo-command-center")
   - Select region closest to your users
   - Wait for project provisioning (~2 minutes)

2. **Enable pgvector extension**
   ```sql
   -- In Supabase SQL Editor, run:
   create extension if not exists vector;
   ```

3. **Run the database schema**
   - Navigate to SQL Editor in Supabase dashboard
   - Copy entire contents of `supabase/supabase-schema.sql`
   - Paste and run (takes ~5 seconds)
   - Verify tables created: `programs`, `workstreams`, `tasks`, `weekly_status`, etc.

4. **Seed initial data** (optional but recommended)
   - The schema includes seed data for launch templates
   - Run the INSERT statements at the bottom of the schema file

### Step 2: Configure Environment Variables

1. **Get your Supabase credentials**
   - Go to Settings → API in Supabase dashboard
   - Copy:
     - Project URL (e.g., `https://xxxxx.supabase.co`)
     - `anon` public key

2. **Get API keys for AI features**
   - OpenAI API key: https://platform.openai.com/api-keys
   - Anthropic API key: https://console.anthropic.com/settings/keys

3. **Create `.env` file** in project root:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # For Edge Functions (server-side)
   OPENAI_API_KEY=sk-your-openai-key
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
   ```

### Step 3: Deploy Edge Functions

The app requires 4 Supabase Edge Functions for AI features:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all edge functions
supabase functions deploy transcribe-meeting
supabase functions deploy summarize-meeting
supabase functions deploy generate-embeddings
supabase functions deploy generate-digest
```

**Verify deployment:**
- Check Supabase dashboard → Edge Functions
- All 4 functions should show status "Active"

### Step 4: Deploy Frontend

Choose one of these deployment options:

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /workspace
vercel --prod
```

**Vercel auto-detects:**
- Vite build command
- Output directory (`dist/`)
- Environment variables (add them in Vercel dashboard)

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd /workspace
netlify deploy --prod --dir=dist
```

**Build settings to configure:**
- Build command: `npm run build`
- Publish directory: `dist/`
- Node version: 20.x

#### Option C: Static Hosting (Manual)
Upload contents of `/workspace/dist/` to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- GitHub Pages
- Any static host

### Step 5: Post-Deployment Verification

Test these critical paths:

1. **Authentication**
   - Sign up with email/password
   - Verify confirmation email works
   - Login succeeds

2. **Dashboard**
   - Program cards display correctly
   - RAG status colors render
   - Launch countdown shows

3. **Bandwidth Tracker**
   - Sliders update capacity bar
   - Week navigation works
   - Export generates markdown

4. **Meeting Recording** (browser test)
   - Click "Record Meeting"
   - Allow microphone access
   - Recording widget appears
   - Stop uploads to Supabase Storage

5. **AI Features**
   - Create a test meeting recording
   - Verify transcription completes (check Edge Function logs)
   - Verify summary generation
   - Test Program Brain query

6. **Weekly Digest**
   - Create sample weekly statuses
   - Click "Generate Digest"
   - Verify markdown output

---

## 🔧 Troubleshooting

### Edge Function Errors

**Problem:** Functions return 500 errors
- **Check:** Environment variables set in Supabase dashboard (Settings → Edge Functions)
- **Check:** Function logs in Supabase dashboard
- **Verify:** API keys are valid and have credits

**Problem:** Transcription fails on large files
- **Solution:** Files >25MB need chunking (implemented in edge function)
- **Alternative:** Upload pre-recorded files directly to Storage

### Database Issues

**Problem:** RLS policies block writes
- **Check:** User is authenticated
- **Verify:** `user_id` matches auth.uid()
- **Test:** Run queries in SQL Editor as postgres role

**Problem:** Vector search returns no results
- **Check:** pgvector extension enabled
- **Verify:** Embeddings generated successfully
- **Test:** Query `program_knowledge` table directly

### Build/Deployment Issues

**Problem:** Vite build fails
```bash
npm run build
# Check error messages
```

**Problem:** CORS errors in browser
- **Fix:** Add your domain to Supabase allowed URLs
- Settings → Authentication → Site URL + Redirect URLs

---

## 📊 Monitoring & Maintenance

### Daily Operations
- Monitor Edge Function invocations (Supabase dashboard)
- Check storage usage for recordings
- Review API key usage/costs (OpenAI, Anthropic)

### Weekly Tasks
- Generate AI Weekly Digest every Friday
- Archive old programs (set status = 'closed')
- Review bandwidth allocations for accuracy

### Monthly Maintenance
- Export backup of all data (Settings → Export)
- Review and update launch templates
- Clean up old meeting recordings (>90 days)

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ User can sign up and log in  
✅ Dashboard shows program cards with correct data  
✅ Bandwidth tracker displays and updates allocations  
✅ Meeting recording captures audio and uploads  
✅ Transcription completes within 2-3 minutes  
✅ Summary and action items extracted correctly  
✅ Program Brain answers questions with citations  
✅ Weekly Digest generates comprehensive report  
✅ All keyboard shortcuts work  
✅ Mobile recording functions properly  

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/
- **Edge Functions:** https://supabase.com/docs/guides/functions
- **pgvector:** https://github.com/pgvector/pgvector
- **OpenAI Whisper:** https://platform.openai.com/docs/guides/speech-to-text
- **Anthropic Claude:** https://docs.anthropic.com/claude/docs

---

**Built:** April 2025  
**Version:** 1.0.0  
**License:** MIT
