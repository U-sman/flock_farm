import React, { useState } from 'react';
import { Egg, Plus, Trash2, Pencil } from 'lucide-react';
import { BirdBatch, IncubationRecord, Lang } from '../types';
import { t } from '../i18n';

interface IncubationModuleProps {
  lang: Lang;
  records: IncubationRecord[];
  batches: BirdBatch[];
  onAdd: (record: Omit<IncubationRecord, 'id'>) => void;
  onUpdate: (id: number, record: IncubationRecord) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;
}

export default function IncubationModule({
  lang,
  records,
  batches,
  onAdd,
  onUpdate,
  onDelete,
  canDelete,
}: IncubationModuleProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [eggsSet, setEggsSet] = useState('');
  const [hatchDate, setHatchDate] = useState('');
  const [hatched, setHatched] = useState('');
  const [batchId, setBatchId] = useState('');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const resetForm = () => {
    setEggsSet('');
    setHatchDate('');
    setHatched('');
    setBatchId('');
    setNotes('');
    setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const set = parseInt(eggsSet);
    const hatchedN = parseInt(hatched) || 0;
    if (!set || set <= 0) return alert('Enter eggs set count');

    const payload = {
      startDate,
      eggsSet: set,
      hatchDate: hatchDate || undefined,
      hatched: hatchedN,
      batchId: batchId ? parseInt(batchId) : undefined,
      notes: notes.trim() || undefined,
    };

    if (editId !== null) {
      onUpdate(editId, { id: editId, ...payload });
    } else {
      onAdd(payload);
    }
    resetForm();
  };

  const startEdit = (r: IncubationRecord) => {
    setEditId(r.id);
    setStartDate(r.startDate);
    setEggsSet(String(r.eggsSet));
    setHatchDate(r.hatchDate ?? '');
    setHatched(String(r.hatched));
    setBatchId(r.batchId ? String(r.batchId) : '');
    setNotes(r.notes ?? '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Egg className="w-5 h-5" /> {t(lang, 'incubation')}
        </h2>
        <p className="text-xs text-slate-500">Track eggs set, hatch dates, and hatch rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {canDelete && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> {editId ? t(lang, 'edit') : t(lang, 'add')}
          </h3>
          <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <input type="number" min="1" required placeholder="Eggs set" value={eggsSet} onChange={(e) => setEggsSet(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <input type="date" placeholder="Hatch date" value={hatchDate} onChange={(e) => setHatchDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <input type="number" min="0" placeholder="Hatched count" value={hatched} onChange={(e) => setHatched(e.target.value)} className="w-full px-3 py-2 border rounded-xl" />
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-full px-3 py-2 border rounded-xl">
            <option value="">No batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="w-full px-3 py-2 border rounded-xl h-16 resize-none" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-green-700 text-white rounded-xl font-semibold">{t(lang, 'save')}</button>
            {editId && (
              <button type="button" onClick={resetForm} className="px-3 py-2 border rounded-xl">{t(lang, 'cancel')}</button>
            )}
          </div>
        </form>
        )}

        <div className={canDelete ? "lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" : "lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"}>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-3xs uppercase text-slate-500">
                <th className="p-3">Start</th>
                <th className="p-3">Set</th>
                <th className="p-3">Hatched</th>
                <th className="p-3">Rate</th>
                <th className="p-3">Batch</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...records].sort((a, b) => b.startDate.localeCompare(a.startDate)).map((r) => {
                const rate = r.eggsSet > 0 ? ((r.hatched / r.eggsSet) * 100).toFixed(0) : '0';
                const batch = batches.find((b) => b.id === r.batchId);
                return (
                  <tr key={r.id}>
                    <td className="p-3 font-mono">{r.startDate}</td>
                    <td className="p-3">{r.eggsSet}</td>
                    <td className="p-3">{r.hatched}</td>
                    <td className="p-3 font-bold text-green-700">{rate}%</td>
                    <td className="p-3">{batch?.name ?? '—'}</td>
                    <td className="p-3 text-right space-x-1">
                      {canDelete ? (
                        <>
                          <button type="button" onClick={() => startEdit(r)} className="p-1 text-slate-400 hover:text-indigo-600"><Pencil className="w-4 h-4" /></button>
                          <button type="button" onClick={() => { if (confirm('Delete?')) onDelete(r.id); }} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <span className="text-3xs text-slate-300 italic">view only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">No incubation records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
