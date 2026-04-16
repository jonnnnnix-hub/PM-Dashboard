import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProgramType } from '../types';

interface NewProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewProgramModal({ isOpen, onClose, onSuccess }: NewProgramModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    codename: '',
    program_type: 'migration' as ProgramType,
    status: 'planning' as 'planning' | 'in-flight' | 'launched' | 'closed',
    launch_date: '',
    owner: '',
    stakeholders: '',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('programs').insert([{
        ...formData,
        stakeholders: formData.stakeholders.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      }]);

      if (error) throw error;

      onSuccess();
      onClose();
      setFormData({
        name: '',
        codename: '',
        program_type: 'migration',
        status: 'planning',
        launch_date: '',
        owner: '',
        stakeholders: '',
        description: '',
        tags: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">New Program</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Program Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Hotstar SEA Migration"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Codename *</label>
              <input
                type="text"
                required
                value={formData.codename}
                onChange={(e) => setFormData({ ...formData, codename: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., hotstar-sea"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Program Type *</label>
              <select
                value={formData.program_type}
                onChange={(e) => setFormData({ ...formData, program_type: e.target.value as ProgramType })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="migration">Migration</option>
                <option value="price-increase">Price Increase</option>
                <option value="market-rollout">Market Rollout</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="in-flight">In Flight</option>
                <option value="launched">Launched</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Launch Date *</label>
              <input
                type="date"
                required
                value={formData.launch_date}
                onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Owner *</label>
              <input
                type="text"
                required
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Program lead name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Stakeholders (comma-separated)</label>
            <input
              type="text"
              value={formData.stakeholders}
              onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Sarah K., Mike R., Legal Team"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Program summary / scope"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., migration, APAC, Wave 4"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
