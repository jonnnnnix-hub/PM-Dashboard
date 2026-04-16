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

    const { week_of } = await req.json();

    // Fetch all data needed for digest generation
    const [weeklyStatuses, meetings, tasks, bandwidthAllocations, programs] = await Promise.all([
      supabaseClient
        .from('weekly_status')
        .select('*, programs(name, codename)')
        .eq('week_of', week_of),
      
      supabaseClient
        .from('meetings')
        .select('*, programs(name, codename)')
        .gte('date', week_of)
        .lt('date', new Date(new Date(week_of).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      supabaseClient
        .from('tasks')
        .select('*')
        .or(`completed_at.gte.${week_of},created_at.gte.${week_of}`),
      
      supabaseClient
        .from('bandwidth_allocations')
        .select('*, programs(name, codename)')
        .eq('week_of', week_of),
      
      supabaseClient
        .from('programs')
        .select('*')
        .in('status', ['planning', 'in-flight']),
    ]);

    // Prepare context for Claude
    const context = {
      weeklyStatuses: weeklyStatuses.data || [],
      meetings: meetings.data || [],
      completedTasks: tasks.data?.filter(t => t.completed_at) || [],
      newTasks: tasks.data?.filter(t => new Date(t.created_at) >= new Date(week_of)) || [],
      blockedTasks: tasks.data?.filter(t => t.status === 'blocked') || [],
      bandwidthAllocations: bandwidthAllocations.data || [],
      programs: programs.data || [],
    };

    // Call Anthropic Claude API for digest generation
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ANTHROPIC_API_KEY')}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: `You are a senior program management analyst generating a weekly portfolio digest for an LPMO lead. 
Synthesize the provided data into a clear, executive-ready weekly brief. Be direct and concise.

Structure your output as markdown with these sections:

## Portfolio Pulse
One paragraph: how many programs active, overall health, any programs in red, bandwidth utilization this week.

## Bandwidth
Table showing program allocations this week. Note the focus context.

## Program-by-Program
For each active program, a subsection with:
- **RAG status** and one-line summary
- **Launch readiness:** current gate, progress, any overdue items
- **Key accomplishments** this week (2-3 bullets max)
- **Risks/blockers** if any
- **Decisions made** this week if any

## Action Items & Blockers
Aggregated list of open action items and blockers across all programs, grouped by urgency.

## Decisions Made This Week
Consolidated list of all decisions extracted from meetings and status updates.

## Looking Ahead
What's coming next week — upcoming gate deadlines, scheduled launches, key meetings.

## Recommended 1:1 Discussion Topics
2-4 items the LPMO lead should raise with their manager based on the data: escalations, resource conflicts, strategic questions.`,
        messages: [
          { role: 'user', content: `Generate the weekly digest for week of ${week_of} using this data:\n\n${JSON.stringify(context, null, 2)}` }
        ]
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.statusText}`);
    }

    const claudeData = await claudeResponse.json();
    const digestMarkdown = claudeData.content[0].text;

    // Store or update the weekly digest
    const existingDigest = await supabaseClient
      .from('weekly_digests')
      .select('id')
      .eq('week_of', week_of)
      .single();

    let result;
    if (existingDigest.data) {
      result = await supabaseClient
        .from('weekly_digests')
        .update({
          digest_markdown: digestMarkdown,
          generated_at: new Date().toISOString(),
          source_data: context,
        })
        .eq('week_of', week_of);
    } else {
      result = await supabaseClient
        .from('weekly_digests')
        .insert({
          week_of,
          digest_markdown: digestMarkdown,
          generated_at: new Date().toISOString(),
          source_data: context,
        });
    }

    if (result.error) throw result.error;

    return new Response(
      JSON.stringify({ success: true, digest: digestMarkdown }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Digest generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
