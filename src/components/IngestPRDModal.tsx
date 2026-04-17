import { useState, useRef } from 'react';
import { FileUp, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Modal, Button, Input, Textarea, Select, Field, Chip } from './ui';
import type { ProgramType } from '../types';

interface IngestPRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Stage = 'upload' | 'parsing' | 'review' | 'saving';

interface ParsedProgram {
  name: string;
  codename?: string;
  description?: string;
  program_type?: ProgramType;
  status?: 'planning' | 'in-flight' | 'launched' | 'closed';
  launch_date?: string;
  owner?: string;
  stakeholders?: string[];
  tags?: string[];
  key_dates?: { label: string; date: string }[];
  confidence?: number;
}

const PROGRAM_TYPES: ProgramType[] = ['migration', 'price-increase', 'market-rollout', 'other'];
const STATUSES = ['planning', 'in-flight', 'launched', 'closed'] as const;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix: "data:application/pdf;base64,..."
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function IngestPRDModal({ isOpen, onClose, onSuccess }: IngestPRDModalProps) {
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedProgram | null>(null);
  const [stakeholdersCsv, setStakeholdersCsv] = useState('');
  const [tagsCsv, setTagsCsv] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStage('upload');
    setFile(null);
    setPastedText('');
    setError(null);
    setParsed(null);
    setStakeholdersCsv('');
    setTagsCsv('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleParse() {
    setError(null);
    if (!file && !pastedText.trim()) {
      setError('Upload a PDF or paste PRD text to continue.');
      return;
    }
    setStage('parsing');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const body: Record<string, unknown> = {};
      if (file) {
        body.filename = file.name;
        body.mime_type = file.type || 'application/pdf';
        body.data_base64 = await fileToBase64(file);
      } else {
        body.text = pastedText;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-prd`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ANON_KEY}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Parse failed (${response.status}): ${errText.slice(0, 200)}`);
      }
      const json = await response.json();
      if (!json.success || !json.program) {
        throw new Error(json.error || 'Parsing returned no program');
      }
      const program: ParsedProgram = json.program;
      setParsed(program);
      setStakeholdersCsv((program.stakeholders || []).join(', '));
      setTagsCsv((program.tags || []).join(', '));
      setStage('review');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse PRD';
      setError(msg);
      setStage('upload');
    }
  }

  async function handleCreate() {
    if (!parsed) return;
    setStage('saving');
    setError(null);
    try {
      const payload = {
        name: parsed.name,
        codename: parsed.codename || null,
        description: parsed.description || null,
        program_type: (PROGRAM_TYPES.includes(parsed.program_type as ProgramType) ? parsed.program_type : 'other') as ProgramType,
        status: parsed.status || 'planning',
        launch_date: parsed.launch_date || null,
        owner: parsed.owner || null,
        stakeholders: stakeholdersCsv.split(',').map((s) => s.trim()).filter(Boolean),
        tags: tagsCsv.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const { error } = await supabase.from('programs').insert([payload]);
      if (error) throw error;
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create program';
      setError(msg);
      setStage('review');
    }
  }

  function updateParsed<K extends keyof ParsedProgram>(key: K, value: ParsedProgram[K]) {
    setParsed((p) => (p ? { ...p, [key]: value } : p));
  }

  const footer = stage === 'review' ? (
    <>
      <Button variant="ghost" onClick={handleClose}>Cancel</Button>
      <Button variant="secondary" onClick={() => setStage('upload')}>Re-upload</Button>
      <Button variant="primary" onClick={handleCreate} leftIcon={<CheckCircle2 size={16} />}>
        Create program
      </Button>
    </>
  ) : stage === 'upload' ? (
    <>
      <Button variant="ghost" onClick={handleClose}>Cancel</Button>
      <Button
        variant="primary"
        onClick={handleParse}
        leftIcon={<Sparkles size={16} />}
        disabled={!file && !pastedText.trim()}
      >
        Parse with Claude
      </Button>
    </>
  ) : null;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Ingest PRD"
      description="Upload a product requirements doc — Claude will extract program details and key dates."
      size="xl"
      footer={footer}
    >
      {error && (
        <div
          className="mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'var(--danger-soft, #FEE2E2)', color: 'var(--danger, #B91C1C)' }}
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {stage === 'parsing' && (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <div className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
            Parsing PRD with Claude…
          </div>
          <div className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
            Extracting name, dates, owner, stakeholders, and tags
          </div>
        </div>
      )}

      {stage === 'saving' && (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <div className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
            Creating program…
          </div>
        </div>
      )}

      {stage === 'upload' && (
        <div className="space-y-5">
          {/* File drop */}
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: 'var(--ink-tertiary)' }}
            >
              Upload PDF
            </label>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) setFile(f);
              }}
              className="rounded-xl border-2 border-dashed px-6 py-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
              style={{
                borderColor: file ? 'var(--accent)' : 'var(--border-strong)',
                background: file ? 'var(--accent-soft)' : 'var(--bg-subtle)',
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText size={24} style={{ color: 'var(--accent)' }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                      {file.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                      {(file.size / 1024).toFixed(1)} KB · Click to replace
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = '';
                    }}
                    className="ml-2 w-7 h-7 rounded-full inline-flex items-center justify-center"
                    style={{ background: 'var(--bg-surface)', color: 'var(--ink-secondary)' }}
                    aria-label="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <FileUp size={28} style={{ color: 'var(--ink-tertiary)' }} />
                  <div className="mt-3 text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                    Drop a PDF here or click to upload
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                    PRDs, product briefs, launch plans
                  </div>
                </>
              )}
            </div>
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-[11px] font-semibold tracking-wider" style={{ color: 'var(--ink-tertiary)' }}>OR PASTE TEXT</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <Field label="PRD text" hint="Paste the raw content of your PRD — Claude will extract fields.">
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={6}
              placeholder="Paste PRD contents, launch plan, or product brief here…"
            />
          </Field>
        </div>
      )}

      {stage === 'review' && parsed && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bg-subtle)' }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ color: 'var(--ink-secondary)' }}>Review and edit extracted fields before creating the program.</span>
            {typeof parsed.confidence === 'number' && (
              <Chip tone={parsed.confidence >= 0.7 ? 'success' : parsed.confidence >= 0.4 ? 'amber' : 'rose'} size="sm" className="ml-auto">
                {Math.round((parsed.confidence || 0) * 100)}% confidence
              </Chip>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Program name" required>
              <Input value={parsed.name || ''} onChange={(e) => updateParsed('name', e.target.value)} />
            </Field>
            <Field label="Codename">
              <Input value={parsed.codename || ''} onChange={(e) => updateParsed('codename', e.target.value)} />
            </Field>
            <Field label="Program type">
              <Select
                value={PROGRAM_TYPES.includes(parsed.program_type as ProgramType) ? (parsed.program_type as string) : 'other'}
                onChange={(e) => updateParsed('program_type', e.target.value as ProgramType)}
              >
                {PROGRAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={parsed.status || 'planning'}
                onChange={(e) => updateParsed('status', e.target.value as typeof STATUSES[number])}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Launch date" hint="Used to auto-calculate T-60, T-30, and T-1 LRM dates.">
              <Input
                type="date"
                value={parsed.launch_date || ''}
                onChange={(e) => updateParsed('launch_date', e.target.value)}
              />
            </Field>
            <Field label="Owner">
              <Input value={parsed.owner || ''} onChange={(e) => updateParsed('owner', e.target.value)} />
            </Field>
            <Field label="Stakeholders" hint="Comma-separated" className="md:col-span-2">
              <Input value={stakeholdersCsv} onChange={(e) => setStakeholdersCsv(e.target.value)} />
            </Field>
            <Field label="Tags" hint="Comma-separated" className="md:col-span-2">
              <Input value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <Textarea
                rows={3}
                value={parsed.description || ''}
                onChange={(e) => updateParsed('description', e.target.value)}
              />
            </Field>
          </div>

          {parsed.key_dates && parsed.key_dates.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ink-tertiary)' }}>
                Key dates found in document
              </div>
              <div className="flex flex-wrap gap-2">
                {parsed.key_dates.map((kd, i) => (
                  <Chip key={i} tone="indigo" size="sm">
                    {kd.label}: {kd.date}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default IngestPRDModal;
