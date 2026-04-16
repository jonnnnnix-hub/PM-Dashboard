import { ACCENT_VAR, type AccentName, cn } from './tokens';

interface AvatarProps {
  name: string;
  size?: 24 | 32 | 40 | 48 | 64;
  accent?: AccentName;
  status?: 'online' | 'busy' | 'offline';
  className?: string;
}

function initials(name: string): string {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ACCENTS: AccentName[] = ['coral', 'amber', 'teal', 'indigo', 'rose', 'sky'];

function pickAccent(name: string): AccentName {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 100000;
  return ACCENTS[h % ACCENTS.length];
}

const FONT: Record<number, string> = {
  24: 'text-[10px]',
  32: 'text-xs',
  40: 'text-sm',
  48: 'text-[15px]',
  64: 'text-lg',
};

export function Avatar({ name, size = 32, accent, status, className = '' }: AvatarProps) {
  const tone = ACCENT_VAR[accent ?? pickAccent(name || 'lpmo')];
  return (
    <span className={cn('relative inline-block flex-shrink-0', className)} style={{ width: size, height: size }}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold w-full h-full select-none',
          FONT[size]
        )}
        style={{
          background: tone.soft,
          color: tone.ink,
        }}
        title={name}
      >
        {initials(name)}
      </span>
      {status && (
        <span
          className="absolute bottom-0 right-0 rounded-full"
          style={{
            width: Math.max(8, size / 4),
            height: Math.max(8, size / 4),
            background:
              status === 'online'
                ? 'var(--success)'
                : status === 'busy'
                ? 'var(--warning)'
                : 'var(--ink-tertiary)',
            border: '2px solid var(--bg-surface)',
          }}
        />
      )}
    </span>
  );
}

export default Avatar;
