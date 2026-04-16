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

    const { meeting_id, transcript } = await req.json();

    // Call Anthropic Claude API for summarization and extraction
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ANTHROPIC_API_KEY')}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: `You are an expert program management analyst. Given a meeting transcript, produce:

1. **Summary**: A concise 3-5 paragraph executive summary of the meeting. Focus on decisions made, status updates, and strategic context.

2. **Key Points**: A JSON array of the 5-10 most important points discussed. Each should be a clear, standalone statement.

3. **Action Items**: A JSON array of objects with { "item": string, "owner": string, "due_date": string | null }. Extract every commitment or next step mentioned. Infer owners from context. Leave due_date null if not mentioned.

4. **Decisions**: A JSON array of objects with { "decision": string, "context": string, "made_by": string | null }. Extract every decision that was made or confirmed during the meeting. Include the reasoning or context behind each decision.

Respond in this exact JSON structure:
{
  "summary": "...",
  "key_points": ["...", "..."],
  "action_items": [{ "item": "...", "owner": "...", "due_date": null }],
  "decisions": [{ "decision": "...", "context": "...", "made_by": null }]
}`,
        messages: [
          { role: 'user', content: `Here is the meeting transcript:\n\n${transcript}` }
        ]
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.statusText}`);
    }

    const claudeData = await claudeResponse.json();
    const extractedData = JSON.parse(claudeData.content[0].text);

    // Update meeting with summary, key points, action items, and decisions
    const { error } = await supabaseClient
      .from('meetings')
      .update({
        summary: extractedData.summary,
        key_points: extractedData.key_points,
        action_items: extractedData.action_items,
        decisions: extractedData.decisions,
        status: 'ready',
      })
      .eq('id', meeting_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Summarization error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
