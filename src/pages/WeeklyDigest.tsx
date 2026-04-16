import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import {
  FileText,
  Copy,
  Mail,
  RefreshCw,
  Calendar,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Quote,
  Flag,
  AlertTriangle,
  Target,
  Trophy,
} from 'lucide-react';
import type { WeeklyDigest } from '../types';
import { Shell } from '../components/ui/Shell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import type { AccentName } from '../components/ui/tokens';

type Section = {
  heading: string;
  items: string[];
  accent: AccentName;
  icon: React.ReactNode;
};

// Parse markdown digest into sections keyed by heading
function parseSections(markdown: string): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let current = '_intro';
  sections[current] = [];
  markdown.split('\n').forEach(line => {
    if (line.startsWith('## ')) {
      current = line.replace('## ', '').trim().toLowerCase();
      sections[current] = [];
    } else if (line.startsWith('- ')) {
      sections[current].push(line.replace('- ', '').trim());
    } else if (line.trim() && !line.startsWith('#')) {
      sections[current].push(line.trim());
    }
  });
  return sections;
}

function matchSection(sections: Record<string, string[]>, keywords: string[]): string[] {
  for (const [heading, items] of Object.entries(sections)) {
    if (keywords.some(k => heading.includes(k))) return items;
  }
  return [];
}

export default function WeeklyDigestPage() {
  const [digests, setDigests] = useState<WeeklyDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDigests();
  }, []);

  const fetchDigests = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_digests')
        .select('*')
        .order('week_of', { ascending: false });
      if (error) throw error;
      if (data) setDigests(data);
    } catch (error) {
      console.error('Error fetching digests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert('Digest generation triggered. In production, this would call the AI pipeline.');
    }, 2000);
  };

  const selectedDigest = digests.find(d => d.week_of.startsWith(selectedWeek));

  const sections = useMemo(() => {
    if (!selectedDigest) return null;
    return parseSections(selectedDigest.digest_markdown || '');
  }, [selectedDigest]);

  const parsedSections: Section[] = useMemo(() => {
    if (!sections) return [];
    return [
      {
        heading: 'Wins',
        items: matchSection(sections, ['win', 'highlight', 'shipped', 'complete']),
        accent: 'teal',
        icon: <Trophy size={16} />,
      },
      {
        heading: 'Risks',
        items: matchSection(sections, ['risk', 'concern']),
        accent: 'amber',
        icon: <AlertTriangle size={16} />,
      },
      {
        heading: 'Blockers',
        items: matchSection(sections, ['blocker', 'escalat']),
        accent: 'rose',
        icon: <Flag size={16} />,
      },
      {
        heading: 'Looking ahead',
        items: matchSection(sections, ['looking', 'ahead', 'next', 'upcoming']),
        accent: 'indigo',
        icon: <Target size={16} />,
      },
    ];
  }, [sections]);

  const decisions = useMemo(() => {
    if (!sections) return [];
    return matchSection(sections, ['decision']);
  }, [sections]);

  const intro = sections?._intro?.join(' ').trim() || '';

  const handleCopy = async () => {
    if (selectedDigest?.digest_markdown) {
      try {
        await navigator.clipboard.writeText(selectedDigest.digest_markdown);
      } catch {
        // ignore
      }
    }
  };

  const topBarRight = (
    <Button
      variant="primary"
      size="sm"
      leftIcon={<RefreshCw size={14} className={generating ? 'animate-spin' : ''} />}
      onClick={handleGenerate}
      loading={generating}
    >
      {generating ? 'Generating…' : 'Generate digest'}
    </Button>
  );

  const rightRail = (
    <div className="space-y-4">
      <Card padding="md">
        <CardHeader
          title="Week selector"
          icon={<Calendar size={16} />}
        />
        <input
          type="week"
          value={selectedWeek.substring(0, 7)}
          onChange={e => setSelectedWeek(e.target.value + '-01')}
          className="w-full text-sm rounded-lg px-3 py-2 focus-ring"
          style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border)',
            color: 'var(--ink-primary)',
          }}
        />
        {selectedDigest && (
          <div className="mt-3">
            <Chip tone="success" size="xs" icon={<CheckCircle2 size={10} />}>
              Generated {formatDate(selectedDigest.generated_at)}
            </Chip>
          </div>
        )}
      </Card>

      {digests.length > 0 && (
        <Card padding="md">
          <CardHeader
            title="Recent digests"
            subtitle={`${digests.length} total`}
            icon={<FileText size={16} />}
          />
          <div className="space-y-2">
            {digests.slice(0, 6).map(digest => {
              const active = selectedDigest?.id === digest.id;
              return (
                <button
                  key={digest.id}
                  onClick={() => setSelectedWeek(digest.week_of.split('T')[0])}
                  className="w-full text-left p-3 rounded-lg focus-ring transition-colors"
                  style={{
                    background: active ? 'var(--coral-soft)' : 'var(--bg-canvas)',
                    border: `1px solid ${active ? 'var(--coral-solid)' : 'var(--border)'}`,
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.borderColor = 'var(--border-strong)';
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div className="text-sm font-medium" style={{ color: active ? 'var(--coral-ink)' : 'var(--ink-primary)' }}>
                    Week of {formatDate(digest.week_of)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
                    {formatDate(digest.generated_at)}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <Shell
      title="Weekly Digest"
      subtitle="Portfolio-level AI summaries for stakeholders"
      breadcrumbs={[{ label: 'Reporting' }, { label: 'Digest' }]}
      topBarRight={topBarRight}
      rightRail={rightRail}
    >
      {loading ? (
        <div className="grid gap-4">
          <Card padding="lg" className="h-48 animate-pulse-slow" />
          <div className="grid grid-cols-2 gap-4">
            <Card padding="md" className="h-48 animate-pulse-slow" />
            <Card padding="md" className="h-48 animate-pulse-slow" />
          </div>
        </div>
      ) : selectedDigest ? (
        <div className="space-y-6">
          {/* Magazine hero */}
          <Card padding="lg" elevated>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <Chip tone="coral" size="sm" icon={<Sparkles size={12} />}>
                    Weekly edition
                  </Chip>
                  <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                    Generated {formatDate(selectedDigest.generated_at)}
                  </span>
                </div>
                <h1
                  className="text-4xl md:text-5xl font-bold leading-tight"
                  style={{
                    fontFamily: '"Fraunces", serif',
                    color: 'var(--ink-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Week of {formatDate(selectedDigest.week_of)}
                </h1>
                {intro && (
                  <p
                    className="mt-4 text-lg leading-relaxed max-w-3xl"
                    style={{ color: 'var(--ink-secondary)' }}
                  >
                    {intro.slice(0, 320)}{intro.length > 320 ? '…' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" leftIcon={<Copy size={14} />} onClick={handleCopy}>
                  Copy
                </Button>
                <Button variant="secondary" size="sm" leftIcon={<Mail size={14} />}>
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw size={14} className={generating ? 'animate-spin' : ''} />}
                  onClick={handleGenerate}
                >
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Metadata strip */}
            <div
              className="mt-6 pt-5 flex items-center gap-6 flex-wrap text-sm"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--ink-secondary)' }}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={14} style={{ color: 'var(--coral-ink)' }} />
                <span className="font-semibold tabular" style={{ color: 'var(--ink-primary)' }}>
                  {selectedDigest.source_data?.meeting_count || 0}
                </span>
                meetings
              </span>
              <span className="flex items-center gap-2">
                <FileText size={14} style={{ color: 'var(--indigo-solid)' }} />
                <span className="font-semibold tabular" style={{ color: 'var(--ink-primary)' }}>
                  {selectedDigest.source_data?.status_count || 0}
                </span>
                statuses
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: 'var(--teal-solid)' }} />
                <span className="font-semibold tabular" style={{ color: 'var(--ink-primary)' }}>
                  {selectedDigest.source_data?.tasks_completed || 0}
                </span>
                tasks shipped
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: 'var(--amber-solid)' }} />
                <span className="font-semibold tabular" style={{ color: 'var(--ink-primary)' }}>
                  {selectedDigest.source_data?.programs_active || 0}
                </span>
                active programs
              </span>
            </div>
          </Card>

          {/* Section cards — magazine style 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedSections.map(section => (
              <Card key={section.heading} padding="md" hover>
                <CardHeader
                  title={section.heading}
                  icon={
                    <span style={{ color: `var(--${section.accent}-ink)` }}>
                      {section.icon}
                    </span>
                  }
                  action={
                    <Chip tone={section.accent} size="xs">
                      {section.items.length}
                    </Chip>
                  }
                />
                {section.items.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--ink-tertiary)' }}>
                    Nothing flagged for this week.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {section.items.slice(0, 6).map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--ink-secondary)' }}>
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: `var(--${section.accent}-solid)` }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>

          {/* Pull-quote style decisions */}
          {decisions.length > 0 && (
            <Card padding="lg" elevated>
              <CardHeader
                title="Key decisions"
                subtitle="Captured this week"
                icon={<Quote size={16} />}
              />
              <div className="space-y-4">
                {decisions.slice(0, 4).map((decision, i) => (
                  <blockquote
                    key={i}
                    className="relative pl-6 py-2"
                    style={{
                      borderLeft: '3px solid var(--coral-solid)',
                    }}
                  >
                    <Quote
                      size={18}
                      className="absolute -left-[2px] -top-1 bg-[var(--bg-surface)] px-0.5"
                      style={{ color: 'var(--coral-solid)' }}
                    />
                    <p
                      className="text-lg leading-snug"
                      style={{
                        fontFamily: '"Fraunces", serif',
                        color: 'var(--ink-primary)',
                        fontWeight: 500,
                      }}
                    >
                      {decision}
                    </p>
                  </blockquote>
                ))}
              </div>
            </Card>
          )}

          {/* Full markdown fallback */}
          <Card padding="lg">
            <CardHeader title="Full digest" subtitle="Raw AI output" icon={<FileText size={16} />} />
            <div className="prose max-w-none">
              <div
                className="whitespace-pre-wrap font-sans leading-relaxed text-sm"
                style={{ color: 'var(--ink-secondary)' }}
              >
                {selectedDigest.digest_markdown.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h2
                        key={i}
                        className="mt-6 mb-3 text-xl font-semibold"
                        style={{ color: 'var(--ink-primary)', fontFamily: '"Fraunces", serif' }}
                      >
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={i} className="mt-4 mb-2 text-base font-semibold" style={{ color: 'var(--ink-primary)' }}>
                        {line.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={i} className="ml-5 list-disc" style={{ color: 'var(--ink-secondary)' }}>
                        {line.replace('- ', '')}
                      </li>
                    );
                  }
                  if (line.startsWith('**') && line.includes(':**')) {
                    const parts = line.split('**');
                    return (
                      <p key={i} className="mt-2">
                        <strong style={{ color: 'var(--ink-primary)' }}>{parts[1]}</strong>
                        {parts[2]}
                      </p>
                    );
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card padding="lg">
          <EmptyState
            icon={<FileText size={24} />}
            title="No digest for this week"
            description="Generate an AI-powered executive brief that synthesizes program status, meetings, completed tasks, and launch readiness into one read."
            accent="coral"
            action={
              <Button
                variant="primary"
                size="md"
                leftIcon={<Sparkles size={14} />}
                onClick={handleGenerate}
                loading={generating}
              >
                Generate now
              </Button>
            }
          />
          <div className="mt-8 max-w-lg mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-tertiary)' }}>
              The digest will include
            </div>
            <ul className="space-y-2 text-sm">
              {[
                'Portfolio pulse — overall health and bandwidth utilization',
                'Program highlights with RAG status and launch readiness',
                'Aggregated action items, blockers, and decisions',
                'Recommended 1:1 discussion topics for your manager',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2" style={{ color: 'var(--ink-secondary)' }}>
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--teal-solid)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </Shell>
  );
}
