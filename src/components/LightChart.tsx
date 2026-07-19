import React from 'react';
import { Lang } from '../types';
import { t } from '../i18n';

interface ChartPoint {
  label: string;
  value: number;
}

interface LightBarChartProps {
  title: string;
  data: ChartPoint[];
  color?: string;
  formatValue?: (v: number) => string;
}

export function LightBarChart({ title, data, color = '#16a34a', formatValue }: LightBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-3xs text-slate-400 italic">
        No data
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-3xs">
            <span className="w-14 shrink-0 truncate text-slate-500 font-mono">{d.label}</span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }}
              />
            </div>
            <span className="w-16 text-right font-mono font-semibold text-slate-700 dark:text-slate-200 shrink-0">
              {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LightSparklineProps {
  title: string;
  values: number[];
  labels?: string[];
}

export function LightSparkline({ title, values, labels }: LightSparklineProps) {
  if (values.length === 0) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
      <p className="text-3xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
      {labels && labels.length > 0 && (
        <div className="flex justify-between text-4xs text-slate-400 font-mono">
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}

interface DateRangeFilterProps {
  lang: Lang;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  onPreset: (preset: 'all' | 'month' | '30d') => void;
}

export function DateRangeFilter({ lang, from, to, onChange, onPreset }: DateRangeFilterProps) {

  return (
    <div className="flex flex-wrap items-center gap-2 text-3xs">
      <span className="font-bold text-slate-400 uppercase">{t(lang, 'dateRange')}:</span>
      {(['all', 'month', '30d'] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPreset(p)}
          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {p === 'all' ? t(lang, 'allTime') : p === 'month' ? t(lang, 'thisMonth') : t(lang, 'last30Days')}
        </button>
      ))}
      <input
        type="date"
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
      />
      <span className="text-slate-400">—</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
      />
    </div>
  );
}
