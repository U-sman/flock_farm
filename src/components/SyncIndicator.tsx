import React from 'react';
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';
import { SyncStatus } from '../types';
import { Lang } from '../types';
import { t } from '../i18n';

interface SyncIndicatorProps {
  status: SyncStatus;
  lang: Lang;
}

export default function SyncIndicator({ status, lang }: SyncIndicatorProps) {
  if (status === 'idle') return null;

  const config = {
    saving: { icon: Loader2, className: 'text-amber-600 animate-spin', label: t(lang, 'syncSaving') },
    saved: { icon: Check, className: 'text-emerald-600', label: t(lang, 'syncSaved') },
    error: { icon: CloudOff, className: 'text-red-600', label: t(lang, 'syncError') },
  }[status] ?? { icon: Cloud, className: 'text-slate-400', label: '' };

  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1 text-3xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <Icon className={`w-3 h-3 ${config.className}`} />
      {config.label}
    </span>
  );
}
