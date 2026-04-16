import type { RAGStatus } from '../../types';
import { Chip } from './Chip';

const COLOR: Record<RAGStatus, string> = {
  green: 'var(--success)',
  yellow: 'var(--warning)',
  red: 'var(--danger)',
};

const LABEL: Record<RAGStatus, string> = {
  green: 'On track',
  yellow: 'At risk',
  red: 'Blocked',
};

export function RagDot({ rag, size = 10 }: { rag?: RAGStatus | null; size?: number }) {
  const color = rag ? COLOR[rag] : 'var(--ink-tertiary)';
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: rag ? `0 0 0 3px color-mix(in oklab, ${color} 22%, transparent)` : 'none',
      }}
      aria-label={rag ? LABEL[rag] : 'No status'}
    />
  );
}

export function RagChip({ rag }: { rag?: RAGStatus | null }) {
  if (!rag) {
    return <Chip tone="neutral" size="sm">No status</Chip>;
  }
  const tone = rag === 'green' ? 'success' : rag === 'yellow' ? 'warning' : 'danger';
  return <Chip tone={tone} size="sm">{LABEL[rag]}</Chip>;
}

export default RagDot;
