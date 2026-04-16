import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProgramType } from '../types';
import { Modal, Button, Input, Textarea, Select, Field } from './ui';

interface NewProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY = {
  name: '',
  codename: '',
  program_type: 'migration' as ProgramType,
  status: 'planning' as 'planning' | 'in-flight' | 'launched' | 'closed',
  launch_date: '',
  owner: '',
  stakeholders: '',
  description: '',
  tags: '',
};

export function NewProgramModal({ isOpen, onClose, onSuccess }: NewProgramModalProps) {
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('programs').insert([
        {
          ...formData,
          stakeholders: formData.stakeholders.split(',').map((s) => s.trim()).filter(Boolean),
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        },
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
      setFormData(EMPTY);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create program';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="New program"
      description="Create a program to start tracking workstreams, gates, and weekly status."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="new-program-form"
            loading={loading}
          >
            Create program
          </Button>
        </>
      }
    >
      <form id="new-program-form" onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="rounded-xl px-3 py-2.5 text-sm"
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              border: '1px solid color-mix(in oklab, var(--danger) 30%, transparent)',
            }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Program name" required>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hotstar SEA Migration"
            />
          </Field>
          <Field label="Codename" required>
            <Input
              required
              value={formData.codename}
              onChange={(e) => setFormData({ ...formData, codename: e.target.value })}
              placeholder="e.g., hotstar-sea"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Program type" required>
            <Select
              value={formData.program_type}
              onChange={(e) =>
                setFormData({ ...formData, program_type: e.target.value as ProgramType })
              }
            >
              <option value="migration">Migration</option>
              <option value="price-increase">Price Increase</option>
              <option value="market-rollout">Market Rollout</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Status" required>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
            >
              <option value="planning">Planning</option>
              <option value="in-flight">In Flight</option>
              <option value="launched">Launched</option>
              <option value="closed">Closed</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Launch date" required>
            <Input
              type="date"
              required
              value={formData.launch_date}
              onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
            />
          </Field>
          <Field label="Owner" required>
            <Input
              required
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="Program lead name"
            />
          </Field>
        </div>

        <Field label="Stakeholders" hint="Comma-separated names or teams">
          <Input
            value={formData.stakeholders}
            onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
            placeholder="e.g., Sarah K., Mike R., Legal Team"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Program scope and key objectives"
          />
        </Field>

        <Field label="Tags" hint="Comma-separated">
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., migration, APAC, Wave 4"
          />
        </Field>
      </form>
    </Modal>
  );
}

export default NewProgramModal;
