import { useState } from 'react';
import {
  Settings2,
  Key,
  FileText,
  Bell,
  Database,
  Download,
  Palette,
  Save,
  Sparkles,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Shell } from '../components/ui/Shell';
import { Card, CardHeader } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Input, Select, Field } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

type TabId = 'api' | 'templates' | 'defaults' | 'notifications' | 'export' | 'appearance';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('api');

  const tabs = [
    { id: 'api' as const, label: 'API Keys', icon: <Key size={14} /> },
    { id: 'appearance' as const, label: 'Appearance', icon: <Palette size={14} /> },
    { id: 'templates' as const, label: 'Templates', icon: <FileText size={14} /> },
    { id: 'defaults' as const, label: 'Defaults', icon: <Settings2 size={14} /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell size={14} /> },
    { id: 'export' as const, label: 'Data export', icon: <Database size={14} /> },
  ];

  return (
    <Shell
      title="Settings"
      subtitle="Configure integrations, templates, and preferences"
      breadcrumbs={[{ label: 'Workspace' }, { label: 'Settings' }]}
    >
      <div className="space-y-6">
        <Tabs<TabId> tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'api' && <ApiKeysTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'templates' && <LaunchTemplatesTab />}
        {activeTab === 'defaults' && <DefaultsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'export' && <DataExportTab />}
      </div>
    </Shell>
  );
}

/* ================= API Keys ================= */

function ApiKeysTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card padding="lg">
          <CardHeader
            title="AI integrations"
            subtitle="Keys are stored securely and used server-side"
            icon={<Key size={16} />}
          />
          <div className="space-y-5">
            <Field
              label="Anthropic API Key (Claude)"
              hint="Used for meeting summarization, weekly digest, and Program Brain RAG queries."
            >
              <Input type="password" placeholder="sk-ant-…" />
            </Field>

            <Field
              label="OpenAI API Key (Whisper + Embeddings)"
              hint="Used for audio transcription and vector embeddings."
            >
              <Input type="password" placeholder="sk-…" />
            </Field>

            <Field
              label="Perplexity API Key"
              hint="Optional — used for market research in Program Brain."
            >
              <Input type="password" placeholder="pplx-…" />
            </Field>

            <div className="flex items-center gap-2 pt-2">
              <Button variant="primary" size="md" leftIcon={<Save size={14} />}>
                Save API keys
              </Button>
              <Button variant="ghost" size="md">
                Test connections
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card padding="md">
          <CardHeader title="Connection status" icon={<Sparkles size={16} />} />
          <div className="space-y-3">
            {[
              { name: 'Supabase', tone: 'success' as const, status: 'Connected' },
              { name: 'Anthropic', tone: 'success' as const, status: 'Connected' },
              { name: 'OpenAI', tone: 'warning' as const, status: 'Not configured' },
              { name: 'Perplexity', tone: 'neutral' as const, status: 'Optional' },
            ].map(svc => (
              <div key={svc.name} className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                  {svc.name}
                </span>
                <Chip tone={svc.tone} size="xs">{svc.status}</Chip>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= Appearance ================= */

function AppearanceTab() {
  const { theme } = useTheme();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="lg">
        <CardHeader
          title="Theme"
          subtitle="Switch between light and dark modes"
          icon={<Palette size={16} />}
        />
        <div
          className="flex items-center justify-between rounded-xl p-4"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
              Applies across every page. Persists to this browser.
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { name: 'Coral', color: 'var(--coral-solid)' },
            { name: 'Amber', color: 'var(--amber-solid)' },
            { name: 'Teal', color: 'var(--teal-solid)' },
            { name: 'Indigo', color: 'var(--indigo-solid)' },
            { name: 'Rose', color: 'var(--rose-solid)' },
            { name: 'Sky', color: 'var(--sky-solid)' },
          ].map(c => (
            <div
              key={c.name}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border)' }}
            >
              <span
                className="w-8 h-8 rounded-lg shrink-0"
                style={{ background: c.color }}
              />
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>{c.name}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--ink-tertiary)' }}>Accent</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader
          title="Typography"
          subtitle="Default fonts used across the app"
          icon={<FileText size={16} />}
        />
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--ink-tertiary)' }}>
              Display — Fraunces
            </div>
            <div
              className="text-3xl font-semibold"
              style={{ fontFamily: '"Fraunces", serif', color: 'var(--ink-primary)' }}
            >
              Ship with clarity.
            </div>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--ink-tertiary)' }}>
              UI — Inter
            </div>
            <div className="text-base" style={{ color: 'var(--ink-primary)' }}>
              The quick brown fox jumps over the lazy dog — 1234567890
            </div>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
          >
            <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--ink-tertiary)' }}>
              Mono — JetBrains Mono
            </div>
            <div className="text-sm font-mono tabular" style={{ color: 'var(--ink-primary)' }}>
              const launch = &quot;2026-05-14&quot;;
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================= Templates ================= */

function LaunchTemplatesTab() {
  const templates = [
    { type: 'migration', name: 'Migration Launch Template', gates: 6, accent: 'indigo' as const },
    { type: 'price-increase', name: 'Price Increase Template', gates: 6, accent: 'teal' as const },
    { type: 'market-rollout', name: 'Market Rollout Template', gates: 6, accent: 'rose' as const },
    { type: 'other', name: 'Custom Template', gates: 0, accent: 'sky' as const },
  ];

  return (
    <div className="space-y-6">
      <Card padding="md">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
              Launch checklist templates
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
              Master templates cloned when creating a new program's launch checklist.
            </div>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
            Create template
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <Card key={template.type} padding="md" hover>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `var(--${template.accent}-soft)`, color: `var(--${template.accent}-ink)` }}
                >
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{template.name}</h4>
                  <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
                    {template.type.replace('-', ' ')}
                  </p>
                </div>
              </div>
              <Chip tone={template.accent} size="xs">
                {template.gates} gate{template.gates === 1 ? '' : 's'}
              </Chip>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" fullWidth>Edit</Button>
              <Button variant="ghost" size="sm" fullWidth>Preview</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================= Defaults ================= */

function DefaultsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="lg">
        <CardHeader
          title="Program defaults"
          subtitle="Used when you create a new program"
          icon={<Settings2 size={16} />}
        />
        <div className="space-y-5">
          <Field label="Default program type">
            <Select>
              <option value="migration">Migration</option>
              <option value="price-increase">Price Increase</option>
              <option value="market-rollout">Market Rollout</option>
              <option value="other">Other</option>
            </Select>
          </Field>

          <Field label="Default launch template">
            <Select>
              <option value="migration">Migration Launch Template</option>
              <option value="price-increase">Price Increase Template</option>
              <option value="market-rollout">Market Rollout Template</option>
              <option value="none">None (create blank)</option>
            </Select>
          </Field>

          <Field label="Default owner">
            <Input placeholder="Alex Park" defaultValue="Alex Park" />
          </Field>

          <div className="pt-2">
            <Button variant="primary" size="md" leftIcon={<Save size={14} />}>
              Save defaults
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader
          title="Bandwidth defaults"
          subtitle="Planning assumptions for weekly tracking"
          icon={<Sparkles size={16} />}
        />
        <div className="space-y-5">
          <Field label="Target weekly capacity" hint="Used to calculate utilization">
            <Input type="number" defaultValue={100} rightSlot={<span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>%</span>} />
          </Field>
          <Field label="Week start">
            <Select defaultValue="monday">
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </Select>
          </Field>
          <Field label="Default program allocation">
            <Input type="number" defaultValue={20} rightSlot={<span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>%</span>} />
          </Field>
          <div className="pt-2">
            <Button variant="primary" size="md" leftIcon={<Save size={14} />}>
              Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================= Notifications ================= */

function ToggleRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div
      className="flex items-center justify-between py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="pr-4">
        <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
          {title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
          {description}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(v => !v)}
        className="relative inline-flex items-center rounded-full transition-colors focus-ring shrink-0"
        style={{
          width: 44,
          height: 24,
          background: checked ? 'var(--coral-solid)' : 'var(--border-strong)',
        }}
      >
        <span
          className="absolute rounded-full bg-white shadow transition-transform"
          style={{
            width: 20,
            height: 20,
            top: 2,
            left: 2,
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

function NotificationsTab() {
  return (
    <Card padding="lg" className="max-w-3xl">
      <CardHeader
        title="Notification preferences"
        subtitle="Choose when and how you want to be notified"
        icon={<Bell size={16} />}
      />
      <div>
        <ToggleRow
          title="Weekly status reminders"
          description="Reminders on Thursdays when status updates are missing"
          defaultChecked
        />
        <ToggleRow
          title="Overdue gate alerts"
          description="Notify when launch gates become overdue with incomplete items"
          defaultChecked
        />
        <ToggleRow
          title="Meeting processing complete"
          description="Notify when transcription and summarization finish"
        />
        <ToggleRow
          title="Digest auto-generation"
          description="Automatically generate the weekly digest every Friday at 4 PM"
          defaultChecked
        />
      </div>
      <div className="mt-5">
        <Button variant="primary" size="md" leftIcon={<Save size={14} />}>
          Save preferences
        </Button>
      </div>
    </Card>
  );
}

/* ================= Data Export ================= */

function DataExportTab() {
  const { programs } = useApp();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {[
          {
            title: 'Full data export',
            description: 'All programs, meetings, statuses, and documents in JSON format',
            accent: 'coral' as const,
            action: (
              <Button variant="primary" size="sm" leftIcon={<Download size={14} />}>
                Export JSON
              </Button>
            ),
          },
          {
            title: 'Per-program export',
            description: 'Export an individual program as a ZIP with all artifacts',
            accent: 'indigo' as const,
            action: (
              <div className="flex items-center gap-2">
                <Select compact className="w-48">
                  <option value="">Select program…</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
                <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>
                  Export
                </Button>
              </div>
            ),
          },
          {
            title: 'Meeting transcripts',
            description: 'Export every meeting transcript as text files',
            accent: 'teal' as const,
            action: (
              <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>
                Export TXT
              </Button>
            ),
          },
        ].map(row => (
          <Card key={row.title} padding="md">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `var(--${row.accent}-soft)`, color: `var(--${row.accent}-ink)` }}
                >
                  <Database size={18} />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--ink-primary)' }}>{row.title}</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>{row.description}</p>
                </div>
              </div>
              {row.action}
            </div>
          </Card>
        ))}
      </div>

      <Card padding="md">
        <CardHeader title="Export tips" icon={<Sparkles size={16} />} />
        <ul className="space-y-2.5 text-sm" style={{ color: 'var(--ink-secondary)' }}>
          {[
            'JSON exports include all related records.',
            'Per-program exports preserve folder structure.',
            'Transcripts come with timestamps when available.',
            'Large exports may take a few minutes.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--teal-solid)' }} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
