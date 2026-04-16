import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
    
    if (end >= text.length) break;
  }
  
  return chunks;
}

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

    const { meeting_id, program_id, transcript, summary, key_points, decisions } = await req.json();

    const embeddingsToInsert: any[] = [];

    // Chunk and embed transcript
    const transcriptChunks = chunkText(transcript);
    for (let i = 0; i < transcriptChunks.length; i++) {
      const chunk = transcriptChunks[i];
      
      // Call OpenAI Embeddings API
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: chunk,
        }),
      });

      if (!embeddingResponse.ok) {
        throw new Error(`OpenAI Embeddings API error: ${embeddingResponse.statusText}`);
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      embeddingsToInsert.push({
        program_id,
        meeting_id,
        content: chunk,
        embedding,
        source_type: 'transcript',
        metadata: { chunk_index: i, total_chunks: transcriptChunks.length },
      });
    }

    // Embed summary as a single chunk
    if (summary) {
      const summaryEmbeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: summary,
        }),
      });

      if (summaryEmbeddingResponse.ok) {
        const summaryEmbeddingData = await summaryEmbeddingResponse.json();
        const summaryEmbedding = summaryEmbeddingData.data[0].embedding;

        embeddingsToInsert.push({
          program_id,
          meeting_id,
          content: summary,
          embedding: summaryEmbedding,
          source_type: 'summary',
          metadata: {},
        });
      }
    }

    // Embed key points
    if (key_points && Array.isArray(key_points)) {
      for (const point of key_points) {
        const pointEmbeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: point,
          }),
        });

        if (pointEmbeddingResponse.ok) {
          const pointEmbeddingData = await pointEmbeddingResponse.json();
          const pointEmbedding = pointEmbeddingData.data[0].embedding;

          embeddingsToInsert.push({
            program_id,
            meeting_id,
            content: point,
            embedding: pointEmbedding,
            source_type: 'key_point',
            metadata: {},
          });
        }
      }
    }

    // Embed decisions
    if (decisions && Array.isArray(decisions)) {
      for (const decision of decisions) {
        const decisionText = typeof decision === 'string' ? decision : decision.decision;
        const decisionEmbeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: decisionText,
          }),
        });

        if (decisionEmbeddingResponse.ok) {
          const decisionEmbeddingData = await decisionEmbeddingResponse.json();
          const decisionEmbedding = decisionEmbeddingData.data[0].embedding;

          embeddingsToInsert.push({
            program_id,
            meeting_id,
            content: decisionText,
            embedding: decisionEmbedding,
            source_type: 'decision',
            metadata: typeof decision === 'object' ? decision : {},
          });
        }
      }
    }

    // Insert all embeddings into program_knowledge table
    if (embeddingsToInsert.length > 0) {
      const { error } = await supabaseClient
        .from('program_knowledge')
        .insert(embeddingsToInsert);

      if (error) throw error;
    }

    // Update meeting with embedding IDs
    const embeddingIds = embeddingsToInsert.map((_, i) => `emb-${i}`);
    const { error: updateError } = await supabaseClient
      .from('meetings')
      .update({ embedding_ids: embeddingIds })
      .eq('id', meeting_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, count: embeddingsToInsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Embedding generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
