import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Task, TaskStatus, TaskPriority, Workstream } from '@/types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Task, 'id' | 'created_at'>) => void;
  programId: string;
  workstreams: Workstream[];
  initial?: Task;
  defaultStatus?: TaskStatus;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done', 'blocked'];

export function TaskForm({ open, onClose, onSave, programId, workstreams, initial, defaultStatus }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [assignee, setAssignee] = useState(initial?.assignee ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? defaultStatus ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [workstreamId, setWorkstreamId] = useState(initial?.workstream_id ?? '');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      description: description.trim(),
      assignee: assignee.trim(),
      status,
      priority,
      workstream_id: workstreamId || '',
      program_id: programId,
      due_date: dueDate || null,
      completed_at: status === 'done' ? new Date().toISOString() : null,
      source_meeting_id: initial?.source_meeting_id ?? null,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label block mb-1">Title *</label>
          <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="label block mb-1">Description</label>
          <textarea className="textarea w-full" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1">Assignee</label>
            <input className="input w-full" value={assignee} onChange={e => setAssignee(e.target.value)} />
          </div>
          <div>
            <label className="label block mb-1">Due Date</label>
            <input type="date" className="input w-full" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-1">Status</label>
            <select className="select w-full" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label block mb-1">Priority</label>
            <select className="select w-full" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {workstreams.length > 0 && (
          <div>
            <label className="label block mb-1">Workstream</label>
            <select className="select w-full" value={workstreamId} onChange={e => setWorkstreamId(e.target.value)}>
              <option value="">None</option>
              {workstreams.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </form>
    </Modal>
  );
}
