import React from 'react';
import { Layers } from 'lucide-react';
import { BirdBatch, Lang } from '../types';

interface BatchManagerProps {
  lang: Lang;
  batches: BirdBatch[];
  onAdd: (b: Omit<BirdBatch, 'id'>) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;
  compact?: boolean;
}

export default function BatchManager({ batches, onAdd, onDelete, canDelete, compact }: BatchManagerProps) {
  const [name, setName] = React.useState('');
  const [startDate, setStartDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [desc, setDesc] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), startDate, description: desc.trim() || undefined });
    setName('');
    setDesc('');
  };

  if (compact) {
    return (
      <select className="w-full text-xs px-3 py-2 border rounded-xl">
        <option value="">No batch</option>
        {batches.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-bold text-sm flex items-center gap-2">
        <Layers className="w-4 h-4" /> Batches / Groups
      </h4>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 text-xs">
        <input placeholder="Batch name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-32 px-3 py-2 border rounded-xl" />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded-xl" />
        <input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="flex-1 min-w-32 px-3 py-2 border rounded-xl" />
        <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold">Add</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {batches.map((b) => (
          <span key={b.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-900 rounded-full text-3xs font-semibold">
            {b.name}
            <span className="text-slate-400 font-mono">{b.startDate}</span>
            {canDelete && (
              <button type="button" onClick={() => onDelete(b.id)} className="text-red-500 hover:text-red-700">×</button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
