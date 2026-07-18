import React, { useState } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle, ShieldCheck, Check, Upload } from 'lucide-react';
import { GlobalSettings } from '../types';

interface SettingsPanelProps {
  settings: GlobalSettings;
  onSaveSettings: (settings: GlobalSettings) => void;
  onResetDatabase: () => void;
  onClearDatabase: () => void;
  onImportRealFarmData: () => void;
}

export default function SettingsPanel({
  settings,
  onSaveSettings,
  onResetDatabase,
  onClearDatabase,
  onImportRealFarmData
}: SettingsPanelProps) {
  const [eggPrice, setEggPrice] = useState(settings.defaultPricePerEgg.toString());
  const [vacInterval, setVacInterval] = useState(settings.vaccinationIntervalDays.toString());
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(eggPrice);
    const interval = parseInt(vacInterval);

    if (!price || price <= 0) return alert('Please enter a valid egg price');
    if (!interval || interval <= 0) return alert('Please enter a valid vaccination interval');

    onSaveSettings({
      defaultPricePerEgg: price,
      vaccinationIntervalDays: interval
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="settings-tab">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800">App Settings</h2>
        <p className="text-xs text-slate-500">Configure global variables used in automated formula calculations and vaccine scheduling compliance logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
        {/* Core settings form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs md:col-span-2 space-y-5">
          <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-slate-500" /> General Configuration
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
            {showSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Global configuration variables updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Default Price Per Egg (Rs) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-semibold">Rs</span>
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    placeholder="e.g. 25"
                    value={eggPrice}
                    onChange={(e) => setEggPrice(e.target.value)}
                    className="w-full text-xs pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-hidden font-mono font-bold text-slate-700"
                    id="setting-egg-price"
                  />
                </div>
                <p className="text-3xs text-slate-400 mt-1">Calculates commercial Sale Income inside egg logs and monthly dashboards.</p>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Vaccination Interval (Days) *
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 30"
                    value={vacInterval}
                    onChange={(e) => setVacInterval(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-hidden font-mono font-bold text-slate-700"
                    id="setting-vac-interval"
                  />
                </div>
                <p className="text-3xs text-slate-400 mt-1">Schedules vaccinations; tags birds as Overdue or Due Soon based on last vacc date.</p>
              </div>
            </div>

            <button 
              type="submit"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-2xs"
              id="btn-save-settings"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </form>
        </div>

        {/* One-time import of real farm records from Excel */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-4 md:col-span-2">
          <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload className="w-5 h-5 text-emerald-600" /> Import Real Farm Records
          </h3>
          <p className="text-3xs text-slate-500">
            Loads your real records (21 birds, 6 expenses, 5 feed purchases) from your uploaded Excel file.
            This <strong>replaces</strong> your current Birds, Financial Ledger, and Feed records with the real data —
            your egg log is left untouched since no egg entries existed in that file.
          </p>
          <button
            onClick={() => {
              if (confirm('Import your real farm records from Excel? This will replace current Birds, Expenses, and Feed records with the real data. This cannot be undone.')) {
                onImportRealFarmData();
                alert('Your real farm records have been imported successfully!');
              }
            }}
            className="w-full sm:w-auto py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            id="btn-import-real-farm-data"
          >
            <Upload className="w-4 h-4" />
            <span>Import My Excel Farm Data</span>
          </button>
        </div>

        {/* Database administration panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3 text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600" /> Database Utilities
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 space-y-1">
              <h4 className="font-bold text-2xs flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Caution Area
              </h4>
              <p className="text-3xs text-red-700">
                These utilities overwrite browser local cache tables instantly. Export or ensure backup if necessary.
              </p>
            </div>

            <div className="space-y-2.5">
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to restore the default seed dataset? All current changes will be overwritten.')) {
                    onResetDatabase();
                    alert('Database restored successfully with pre-filled seed data!');
                  }
                }}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-3xs"
                id="btn-restore-seed"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Restore Seed Records</span>
              </button>

              <button 
                onClick={() => {
                  if (confirm('CRITICAL WARNING: This will permanently delete all records of birds, expenses, and eggs. This action cannot be undone. Are you absolutely sure?')) {
                    onClearDatabase();
                    alert('Database wiped completely. You can now start fresh.');
                  }
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                id="btn-wipe-db"
              >
                <span>Wipe Database Fresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
