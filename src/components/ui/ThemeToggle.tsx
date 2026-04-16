import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
      className={`relative inline-flex items-center w-[60px] h-8 rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-[3px] ${className}`}
      style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-strong)',
        // @ts-ignore
        '--tw-ring-color': 'var(--accent-ring)',
      }}
    >
      <span
        className="absolute top-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: isDark ? 'translateX(28px)' : 'translateX(0)',
          background: 'var(--bg-surface)',
          color: isDark ? 'var(--indigo)' : 'var(--amber)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
      <span className="sr-only">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export default ThemeToggle;
