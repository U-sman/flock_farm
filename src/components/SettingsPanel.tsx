import React, { useState, useRef } from 'react';
import { 
  Settings, Save, RotateCcw, AlertTriangle, ShieldCheck, Check, 
  FileText, FileSpreadsheet, Download, Upload, ClipboardList
} from 'lucide-react';
import { Bird, OtherExpense, FeedRecord, EggProduction, GlobalSettings } from '../types';
import {
  exportEggPDF,
  exportExpensePDF,
  exportMonthlySummaryPDF,
  exportEggExcel,
  exportExpenseExcel,
  downloadBackup,
  parseBackupFile,
} from '../reportExport';

interface SettingsPanelProps {
  settings: GlobalSettings;
  birds: Bird[];
  otherExpenses: OtherExpense[];
  feedRecords: FeedRecord[];
  eggProduction: EggProduction[];
  onSaveSettings: (settings: GlobalSettings) => void;
  onResetDatabase: () => void;
  onClearDatabase: () => void;
  onRestoreBackup: (data: {
    birds?: Bird[];
    otherExpenses?: OtherExpense[];
    feedRecords?: FeedRecord[];
    eggProduction?: EggProduction[];
    settings?: GlobalSettings;
  }) => void;
}

export default function SettingsPanel({
  settings,
  birds,
  otherExpenses,
  feedRecords,
  eggProduction,
  onSaveSettings,
  onResetDatabase,
  onClearDatabase,
  onRestoreBackup
}: SettingsPanelProps) {
  const [eggPrice, setEggPrice] = useState(settings.defaultPricePerEgg.toString());
  const [vacInterval, setVacInterval] = useState(settings.vaccinationIntervalDays.toString());
  const [showSuccess, setShowSuccess] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const backup = await parseBackupFile(file);
      if (confirm(`Restore backup from ${backup.exportedAt?.slice(0, 10) || 'this file'}? This will replace your current Birds, Ledger, and Egg records.`)) {
        onRestoreBackup(backup);
        alert('Backup restored successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Could not read that backup file.');
    } finally {
      // reset so the same file can be re-selected later if needed
      e.target.value = '';
    }
  };

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

        {/* Export Reports */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-3">
          <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardList className="w-5 h-5 text-teal-600" /> Export Reports
          </h3>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => exportEggPDF(eggProduction, settings)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-full transition cursor-pointer shadow-2xs"
              id="btn-export-egg-pdf"
            >
              <FileText className="w-4 h-4" />
              <span>Egg Report (Print/PDF)</span>
            </button>

            <button
              onClick={() => exportExpensePDF(birds, otherExpenses, feedRecords)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-full transition cursor-pointer shadow-2xs"
              id="btn-export-expense-pdf"
            >
              <FileText className="w-4 h-4" />
              <span>Expense Report (Print/PDF)</span>
            </button>

            <button
              onClick={() => exportEggExcel(eggProduction, settings)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-xs rounded-full transition cursor-pointer"
              id="btn-export-egg-excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Egg CSV</span>
            </button>

            <button
              onClick={() => exportExpenseExcel(birds, otherExpenses, feedRecords)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-xs rounded-full transition cursor-pointer"
              id="btn-export-expense-excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Expense CSV</span>
            </button>

            <button
              onClick={() => exportMonthlySummaryPDF(birds, otherExpenses, feedRecords, eggProduction, settings)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-full transition cursor-pointer shadow-2xs"
              id="btn-export-monthly-summary-pdf"
            >
              <FileText className="w-4 h-4" />
              <span>Monthly Summary (Print/PDF)</span>
            </button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 md:col-span-3">
          <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-teal-600" /> Backup & Restore
          </h3>
          <p className="text-3xs text-slate-500">
            Download a full backup of all your data (birds, ledger, eggs, settings) as a file you can keep safe.
            Restore it anytime to bring your data back — on this device or a new one.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => downloadBackup(birds, otherExpenses, feedRecords, eggProduction, settings)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-full transition cursor-pointer shadow-2xs"
              id="btn-download-backup"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup</span>
            </button>

            <button
              onClick={() => restoreInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-xs rounded-full transition cursor-pointer"
              id="btn-restore-backup"
            >
              <Upload className="w-4 h-4" />
              <span>Restore Backup</span>
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept="application/json"
              onChange={handleRestoreFileSelected}
              className="hidden"
              id="input-restore-backup-file"
            />
          </div>
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
