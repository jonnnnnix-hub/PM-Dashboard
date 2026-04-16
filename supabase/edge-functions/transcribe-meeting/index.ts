import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { meeting_id, audio_url } = await req.json();

    // Download audio from Supabase Storage
    const audioResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/${audio_url}`);
    const audioBlob = await audioResponse.blob();

    // Send to OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      throw new Error(`Whisper API error: ${whisperResponse.statusText}`);
    }

    const transcription = await whisperResponse.json();

    // Update meeting with transcript
    const { error } = await supabaseClient
      .from('meetings')
      .update({
        transcript: transcription.text,
        status: 'transcribed',
      })
      .eq('id', meeting_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, transcript: transcription.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
