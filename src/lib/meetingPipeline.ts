import { supabase } from './supabase';

/**
 * Simulates transcription + AI notes extraction for a freshly-uploaded meeting.
 * Writes progress + stage + final content back to the DB so every client sees it.
 *
 * To swap in a real backend later, replace this function's body with a call to
 * an Edge Function that runs Whisper -> LLM -> writes the same fields. The DB
 * shape and progress semantics stay identical.
 */
export interface ProcessingStage {
  key: 'transcribing' | 'extracting' | 'ready';
  label: string;
  from: number;
  to: number;
  durationMs: number;
}

export const STAGES: ProcessingStage[] = [
  { key: 'transcribing', label: 'Transcribing audio', from: 0, to: 60, durationMs: 14_000 },
  { key: 'extracting', label: 'Extracting AI notes', from: 60, to: 100, durationMs: 10_000 },
];

type PatchFn = (fields: Record<string, unknown>) => Promise<void>;

async function persistPatch(meetingId: string, fields: Record<string, unknown>) {
  const { error } = await supabase
    .from('meetings')
    .update(fields)
    .eq('id', meetingId);
  if (error) console.error('Pipeline patch failed:', error);
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Runs a stage, calling `onTick` at ~400ms intervals with the current progress (0-100).
 */
async function runStage(
  stage: ProcessingStage,
  onTick: (progress: number) => Promise<void>
) {
  const startedAt = performance.now();
  const tickMs = 400;

  while (true) {
    const elapsed = performance.now() - startedAt;
    const t = Math.min(1, elapsed / stage.durationMs);
    const eased = easeOut(t);
    const progress = stage.from + eased * (stage.to - stage.from);
    await onTick(progress);
    if (t >= 1) return;
    await new Promise((res) => setTimeout(res, tickMs));
  }
}

/** Canned AI output used to fill in a newly-processed meeting. */
function buildFakeNotes(title: string, attendees: string[]) {
  const names = attendees.length > 0 ? attendees : ['Team'];
  const firstOwner = names[0];
  const secondOwner = names[1] || firstOwner;

  return {
    transcript:
      `[Auto-generated placeholder transcript for "${title}"]\n\n` +
      `Speaker 1: Thanks everyone for joining. Let's jump right in.\n` +
      `Speaker 2: I've got a few updates on the workstream. We're tracking well against the plan.\n` +
      `Speaker 1: Good. Any blockers we should flag?\n` +
      `Speaker 2: One item on the legal side — waiting on counsel review.\n` +
      `Speaker 1: Okay, let's make sure that's documented and has an owner.`,
    summary:
      `${names.join(', ')} reviewed progress on "${title}". Overall tracking well against plan ` +
      `with one legal-review blocker that needs an owner assigned. Team agreed on next steps ` +
      `and will regroup next week.`,
    key_points: [
      'Workstream tracking on plan against original timeline',
      'Legal review flagged as a blocker pending counsel response',
      'Follow-up sync scheduled for next week',
      'All action items have named owners and due dates',
    ],
    action_items: [
      {
        id: crypto.randomUUID(),
        description: 'Assign an owner to the legal-review blocker and document in the tracker',
        owner: firstOwner,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'open',
      },
      {
        id: crypto.randomUUID(),
        description: 'Circulate updated status slide to stakeholders',
        owner: secondOwner,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'open',
      },
    ],
    decisions: [
      {
        id: crypto.randomUUID(),
        description: 'Continue on current plan pending legal review',
        context: 'Team unanimously agreed no replan needed until legal feedback arrives.',
      },
    ],
  };
}

export async function processMeeting(
  meetingId: string,
  title: string,
  attendees: string[]
) {
  const patch: PatchFn = (fields) => persistPatch(meetingId, fields);

  try {
    // Stage 1: Transcribing
    await patch({
      status: 'transcribing',
      processing_stage: STAGES[0].label,
      progress: 0,
    });
    await runStage(STAGES[0], async (p) => {
      await patch({ progress: Math.round(p) });
    });

    // Stage 2: Extracting AI notes
    await patch({
      status: 'processing',
      processing_stage: STAGES[1].label,
      progress: STAGES[1].from,
    });
    await runStage(STAGES[1], async (p) => {
      await patch({ progress: Math.round(p) });
    });

    // Finalize — write AI-generated content
    const notes = buildFakeNotes(title, attendees);
    await patch({
      status: 'ready',
      processing_stage: null,
      progress: 100,
      ...notes,
    });
  } catch (err) {
    console.error('Processing pipeline failed:', err);
    await patch({ status: 'ready', processing_stage: null });
  }
}
