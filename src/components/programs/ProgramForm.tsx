import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Program, ProgramType, ProgramStatus } from '@/types';

interface ProgramFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Program, 'id' | 'created_at' | 'updated_at'>) => void;
  initial?: Program;
}

const PROGRAM_TYPES: { value: ProgramType; label: string }[] = [
  { value: 'migration', label: 'Migration' },
  { value: 'price-increase', label: 'Price Increase' },
  { value: 'market-rollout', label: 'Market Rollout' },
  { value: 'other', label: 'Other' },
];

const PROGRAM_STATUSES: { value: ProgramStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'in-flight', label: 'In Flight' },
  { value: 'launched', label: 'Launched' },
  { value: 'closed', label: 'Closed' },
];

export function ProgramForm({ open, onClose, onSave, initial }: ProgramFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [codename, setCodename] = useState(initial?.codename ?? '');
  const [programType, setProgramType] = useState<ProgramType>(initial?.program_type ?? 'other');
  const [status, setStatus] = useState<ProgramStatus>(initial?.status ?? 'planning');
  const [launchDate, setLaunchDate] = useState(initial?.launch_date ?? '');
  const [owner, setOwner] = useState(initial?.owner ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [stakeholders, setStakeholders] = useState(initial?.stakeholders.join(', ') ?? '');
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      codename: codename.trim().toUpperCase(),
      program_type: programType,
      status,
      launch_date: launchDate,
      owner: owner.trim(),
      description: description.trim(),
      stakeholders: stakeholders.split(',').map(s => s.trim()).filter(Boolean),
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Program' : 'New Program'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1">Program Name *</label>
            <input className="input w-full" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label block mb-1">Codename</label>
            <input className="input w-full" value={codename} onChange={e => setCodename(e.target.value)} placeholder="e.g. PHOENIX" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1">Type</label>
            <select className="select w-full" value={programType} onChange={e => setProgramType(e.target.value as ProgramType)}>
              {PROGRAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label block mb-1">Status</label>
            <select className="select w-full" value={status} onChange={e => setStatus(e.target.value as ProgramStatus)}>
              {PROGRAM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1">Launch Date</label>
            <input type="date" className="input w-full" value={launchDate} onChange={e => setLaunchDate(e.target.value)} />
          </div>
          <div>
            <label className="label block mb-1">Owner *</label>
            <input className="input w-full" value={owner} onChange={e => setOwner(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label block mb-1">Description</label>
          <textarea className="textarea w-full" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="label block mb-1">Stakeholders <span className="text-slate-500 normal-case">(comma-separated)</span></label>
          <input className="input w-full" value={stakeholders} onChange={e => setStakeholders(e.target.value)} placeholder="VP Engineering, Finance Lead" />
        </div>

        <div>
          <label className="label block mb-1">Tags <span className="text-slate-500 normal-case">(comma-separated)</span></label>
          <input className="input w-full" value={tags} onChange={e => setTags(e.target.value)} placeholder="billing, P0" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Create Program'}</button>
        </div>
      </form>
    </Modal>
  );
}
