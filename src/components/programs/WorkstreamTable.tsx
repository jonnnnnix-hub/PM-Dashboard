import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Workstream, WorkstreamStatus } from '@/types';
import { useDataStore } from '@/data/store';
import { workstreamStatusColor, cn } from '@/lib/utils';

const STATUS_OPTIONS: WorkstreamStatus[] = ['on-track', 'at-risk', 'blocked', 'complete'];

interface WorkstreamTableProps {
  programId: string;
  workstreams: Workstream[];
}

export function WorkstreamTable({ programId, workstreams }: WorkstreamTableProps) {
  const { addWorkstream, updateWorkstream, deleteWorkstream } = useDataStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOwner, setNewOwner] = useState('');

  const sorted = [...workstreams].sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addWorkstream({
      program_id: programId,
      name: newName.trim(),
      owner: newOwner.trim(),
      status: 'on-track',
      notes: '',
      sort_order: workstreams.length,
    });
    setNewName('');
    setNewOwner('');
    setNewRow(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Workstreams</h3>
        <button onClick={() => setNewRow(true)} className="btn-ghost text-blue-400 flex items-center gap-1 text-xs">
          <Plus size={14} /> Add Workstream
        </button>
      </div>

      <div className="border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/50 text-left">
              <th className="w-8 px-2 py-2"></th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Name</th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Owner</th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Notes</th>
              <th className="w-10 px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ws) => (
              <tr
                key={ws.id}
                className="border-t border-slate-700/50 hover:bg-slate-800/30 group"
                onDoubleClick={() => setEditingId(ws.id)}
              >
                <td className="px-2 py-2 text-slate-600">
                  <GripVertical size={14} />
                </td>
                <td className="px-3 py-2">
                  {editingId === ws.id ? (
                    <input
                      className="input w-full py-1 text-sm"
                      defaultValue={ws.name}
                      autoFocus
                      onBlur={(e) => {
                        updateWorkstream(ws.id, { name: e.target.value.trim() || ws.name });
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="text-slate-200">{ws.name}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <input
                    className="bg-transparent text-slate-300 text-sm w-full outline-none focus:bg-slate-900 focus:px-2 focus:py-1 focus:border focus:border-slate-600 transition-all"
                    defaultValue={ws.owner}
                    onBlur={(e) => updateWorkstream(ws.id, { owner: e.target.value.trim() })}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className="bg-transparent text-sm border-none outline-none cursor-pointer"
                    value={ws.status}
                    onChange={(e) => updateWorkstream(ws.id, { status: e.target.value as WorkstreamStatus })}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className={cn(workstreamStatusColor(ws.status), 'ml-1 hidden')}></span>
                </td>
                <td className="px-3 py-2">
                  <input
                    className="bg-transparent text-slate-400 text-sm w-full outline-none focus:bg-slate-900 focus:px-2 focus:py-1 focus:border focus:border-slate-600 transition-all"
                    defaultValue={ws.notes}
                    onBlur={(e) => updateWorkstream(ws.id, { notes: e.target.value.trim() })}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  />
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => deleteWorkstream(ws.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete workstream"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {newRow && (
              <tr className="border-t border-slate-700/50 bg-slate-800/20">
                <td className="px-2 py-2"></td>
                <td className="px-3 py-2">
                  <input
                    className="input w-full py-1 text-sm"
                    placeholder="Workstream name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdd();
                      if (e.key === 'Escape') { setNewRow(false); setNewName(''); setNewOwner(''); }
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="input w-full py-1 text-sm"
                    placeholder="Owner"
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdd();
                      if (e.key === 'Escape') { setNewRow(false); setNewName(''); setNewOwner(''); }
                    }}
                  />
                </td>
                <td className="px-3 py-2" colSpan={2}>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} className="btn-primary py-1 px-3 text-xs">Add</button>
                    <button onClick={() => { setNewRow(false); setNewName(''); setNewOwner(''); }} className="btn-ghost text-xs">Cancel</button>
                  </div>
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>

        {sorted.length === 0 && !newRow && (
          <div className="py-8 text-center text-sm text-slate-500">
            No workstreams yet. Click "Add Workstream" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
