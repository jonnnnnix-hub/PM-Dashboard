# Supabase Edge Functions

This directory contains Supabase Edge Functions for the LPMO Command Center AI pipeline.

## Functions

### transcribe-meeting
- **Purpose**: Transcribes meeting audio using OpenAI Whisper API
- **Input**: `{ meeting_id: string, audio_url: string }`
- **Output**: Transcript text stored in `meetings.transcript`
- **Triggers**: After audio upload completes

### summarize-meeting
- **Purpose**: Generates summary, key points, action items, and decisions from transcript
- **Input**: `{ meeting_id: string, transcript: string }`
- **Output**: Structured data stored in `meetings` table
- **Triggers**: After transcription completes

### generate-embeddings
- **Purpose**: Creates vector embeddings for RAG search
- **Input**: `{ meeting_id, program_id, transcript, summary, key_points, decisions }`
- **Output**: Embeddings stored in `program_knowledge` table
- **Triggers**: After summarization completes

### generate-digest
- **Purpose**: Generates weekly portfolio digest
- **Input**: `{ week_of: string }` (ISO date of Monday)
- **Output**: Markdown digest stored in `weekly_digests` table
- **Triggers**: Manual or scheduled (Friday cron)

## Deployment

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy all functions:
   ```bash
   supabase functions deploy transcribe-meeting
   supabase functions deploy summarize-meeting
   supabase functions deploy generate-embeddings
   supabase functions deploy generate-digest
   ```

5. Set environment variables in Supabase Dashboard → Settings → Edge Functions:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`

## Local Testing

Test functions locally with:
```bash
supabase functions serve transcribe-meeting --env-file .env
```

Then make a POST request:
```bash
curl -X POST http://localhost:54321/functions/v1/transcribe-meeting \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"meeting_id": "...", "audio_url": "..."}'
```

## Integration with Frontend

The frontend calls these functions via Supabase client:

```typescript
const { data, error } = await supabase.functions.invoke('transcribe-meeting', {
  body: { meeting_id, audio_url }
});
```

See `src/pages/MeetingsHub.tsx` for implementation examples.
