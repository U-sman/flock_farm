import React, { useState } from 'react';
import { BookOpen, Save } from 'lucide-react';
import { DiaryEntry, Lang } from '../types';
import { t } from '../i18n';
import { todayStr } from '../utils/calculations';

interface DiaryNotesProps {
  lang: Lang;
  entries: DiaryEntry[];
  onSave: (entry: DiaryEntry) => void;
  readOnly?: boolean;
}

export default function DiaryNotes({ lang, entries, onSave, readOnly }: DiaryNotesProps) {
  const today = todayStr();
  const existing = entries.find((e) => e.date === today);
  const [date, setDate] = useState(today);
  const [note, setNote] = useState(existing?.note ?? '');

  const loadDate = (d: string) => {
    setDate(d);
    const found = entries.find((e) => e.date === d);
    setNote(found?.note ?? '');
  };

  const handleSave = () => {
    if (!note.trim()) return;
    onSave({ date, note: note.trim() });
  };

  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <BookOpen className="w-4 h-4" /> {t(lang, 'diary')}
      </h3>
      <div>
        <label className="block text-3xs font-bold text-slate-400 uppercase mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => loadDate(e.target.value)}
          className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl"
        />
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={readOnly}
        placeholder="Weather, issues, observations…"
        className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl h-24 resize-none"
      />
      {!readOnly && (
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-xs font-semibold rounded-xl"
        >
          <Save className="w-4 h-4" /> {t(lang, 'save')}
        </button>
      )}
      {recent.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-3xs font-bold text-slate-400 uppercase">Recent</p>
          {recent.map((e) => (
            <button
              key={e.date}
              type="button"
              onClick={() => loadDate(e.date)}
              className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-3xs"
            >
              <span className="font-mono text-slate-500">{e.date}</span>
              <p className="text-slate-700 dark:text-slate-200 truncate mt-0.5">{e.note}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
