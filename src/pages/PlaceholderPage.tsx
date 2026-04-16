import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  phase: number;
  description: string;
}

export function PlaceholderPage({ title, phase, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Construction size={48} className="text-slate-600 mb-4" />
      <h2 className="text-xl font-semibold text-slate-200 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md">{description}</p>
      <span className="badge-slate mt-4">Phase {phase}</span>
    </div>
  );
}
