import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bird as BirdIcon, 
  DollarSign, 
  HeartPulse, 
  CalendarRange, 
  Settings as SettingsIcon,
  Activity,
  User,
  Egg,
  Moon,
  Sun
} from 'lucide-react';

import { 
  INITIAL_SETTINGS, 
  INITIAL_BIRDS, 
  INITIAL_EXPENSES, 
  INITIAL_FEED_RECORDS, 
  INITIAL_EGG_PRODUCTION 
} from './initialData';

import {
  IMPORTED_BIRDS,
  IMPORTED_EXPENSES,
  IMPORTED_FEED_RECORDS,
  IMPORTED_EGG_PRODUCTION
} from './importedFarmData';

import { 
  Bird, 
  OtherExpense, 
  FeedRecord, 
  EggProduction, 
  GlobalSettings 
} from './types';

// Components
import Dashboard from './components/Dashboard';
import FlockRegister from './components/FlockRegister';
import FinancialLedger from './components/FinancialLedger';
import HealthPortal from './components/HealthPortal';
import MonthlySummary from './components/MonthlySummary';
import SettingsPanel from './components/SettingsPanel';
import { loadData, saveData } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // --- DARK MODE (UI preference only, saved on this device, not MongoDB) ---
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('flockfarm_dark_mode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('flockfarm_dark_mode', String(isDark));
  }, [isDark]);

  // --- STATE PERSISTENCE LOGIC (MONGODB, VIA BACKEND API) ---
  const [birds, setBirds] = useState<Bird[]>(INITIAL_BIRDS);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(INITIAL_EXPENSES);
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>(INITIAL_FEED_RECORDS);
  const [eggProduction, setEggProduction] = useState<EggProduction[]>(INITIAL_EGG_PRODUCTION);
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load everything from MongoDB (via the backend API) once, on startup
  useEffect(() => {
    (async () => {
      const [b, e, f, eg, s] = await Promise.all([
        loadData<Bird[]>('birds', INITIAL_BIRDS),
        loadData<OtherExpense[]>('expenses', INITIAL_EXPENSES),
        loadData<FeedRecord[]>('feed', INITIAL_FEED_RECORDS),
        loadData<EggProduction[]>('eggs', INITIAL_EGG_PRODUCTION),
        loadData<GlobalSettings>('settings', INITIAL_SETTINGS),
      ]);
      setBirds(b);
      setOtherExpenses(e);
      setFeedRecords(f);
      setEggProduction(eg);
      setSettings(s);
      setIsLoaded(true);
    })();
  }, []);

  // Sync state to MongoDB whenever it changes (skip until the initial
  // load above completes, so we don't overwrite saved data with defaults)
  useEffect(() => {
    if (isLoaded) saveData('birds', birds);
  }, [birds, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveData('expenses', otherExpenses);
  }, [otherExpenses, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveData('feed', feedRecords);
  }, [feedRecords, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveData('eggs', eggProduction);
  }, [eggProduction, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveData('settings', settings);
  }, [settings, isLoaded]);

  // --- DATABASE UTILITIES ---
  const handleResetDatabase = () => {
    setBirds(INITIAL_BIRDS);
    setOtherExpenses(INITIAL_EXPENSES);
    setFeedRecords(INITIAL_FEED_RECORDS);
    setEggProduction(INITIAL_EGG_PRODUCTION);
    setSettings(INITIAL_SETTINGS);
  };

  const handleClearDatabase = () => {
    setBirds([]);
    setOtherExpenses([]);
    setFeedRecords([]);
    setEggProduction([]);
    setSettings({
      defaultPricePerEgg: 25,
      vaccinationIntervalDays: 30
    });
  };

  // Imports the real farm records extracted from the uploaded Excel file.
  // This REPLACES current birds/expenses/feed data with the real records
  // (does not touch egg production, since none were logged in that file).
  const handleImportRealFarmData = () => {
    setBirds(IMPORTED_BIRDS);
    setOtherExpenses(IMPORTED_EXPENSES);
    setFeedRecords(IMPORTED_FEED_RECORDS);
    // Egg sheet in the Excel file had no logged entries, so we leave
    // whatever egg records already exist untouched rather than wiping them.
  };

  // --- FLOCK WORKFLOW HANDLERS ---
  const handleAddBird = (newBird: Omit<Bird, 'id'>) => {
    const nextId = birds.length > 0 ? Math.max(...birds.map(b => b.id)) + 1 : 1;
    setBirds([...birds, { ...newBird, id: nextId }]);
  };

  const handleUpdateBird = (id: number, updatedBird: Bird) => {
    setBirds(birds.map(b => b.id === id ? updatedBird : b));
  };

  const handleDeleteBird = (id: number) => {
    setBirds(birds.filter(b => b.id !== id));
  };

  // --- EXPENSE WORKFLOW HANDLERS ---
  const handleAddOtherExpense = (newExp: Omit<OtherExpense, 'id'>) => {
    const nextId = otherExpenses.length > 0 ? Math.max(...otherExpenses.map(o => o.id)) + 1 : 1;
    setOtherExpenses([...otherExpenses, { ...newExp, id: nextId }]);
  };

  const handleDeleteOtherExpense = (id: number) => {
    setOtherExpenses(otherExpenses.filter(o => o.id !== id));
  };

  // --- FEED RECORD WORKFLOW HANDLERS ---
  const handleAddFeedRecord = (newFeed: Omit<FeedRecord, 'id'>) => {
    const nextId = feedRecords.length > 0 ? Math.max(...feedRecords.map(f => f.id)) + 1 : 1;
    setFeedRecords([...feedRecords, { ...newFeed, id: nextId }]);
  };

  const handleDeleteFeedRecord = (id: number) => {
    setFeedRecords(feedRecords.filter(f => f.id !== id));
  };

  // --- EGG PRODUCTION WORKFLOW HANDLERS ---
  const handleAddEggRecord = (newEgg: EggProduction) => {
    // If date already logged, overwrite/update, else add new record
    const exists = eggProduction.some(ep => ep.date === newEgg.date);
    if (exists) {
      setEggProduction(eggProduction.map(ep => ep.date === newEgg.date ? newEgg : ep));
    } else {
      setEggProduction([...eggProduction, newEgg]);
    }
  };

  const handleDeleteEggRecord = (date: string) => {
    setEggProduction(eggProduction.filter(ep => ep.date !== date));
  };

  // --- QUICK ACTION LINKAGE SHORTCUTS ---
  const [shouldOpenAddBirdModal, setShouldOpenAddBirdModal] = useState(false);
  const [quickOpenLedgerTab, setQuickOpenLedgerTab] = useState<'feed' | 'expense' | 'egg' | null>(null);

  const handleQuickAction = (actionType: 'bird' | 'egg' | 'expense' | 'feed') => {
    if (actionType === 'bird') {
      setActiveTab('flock');
      setShouldOpenAddBirdModal(true);
    } else if (actionType === 'egg') {
      setActiveTab('ledger');
      setQuickOpenLedgerTab('egg');
    } else if (actionType === 'expense') {
      setActiveTab('ledger');
      setQuickOpenLedgerTab('expense');
    } else if (actionType === 'feed') {
      setActiveTab('ledger');
      setQuickOpenLedgerTab('feed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200" id="app-root">
      {/* Top Application Header Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-2.5 h-14 flex items-center justify-between shadow-xs transition-colors duration-200">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0">
              <BirdIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold font-display tracking-tight flex items-center gap-1 text-slate-800 dark:text-slate-100">
                Flock Farm
              </h1>
              <p className="hidden md:block text-4xs text-slate-400 dark:text-slate-500 font-mono tracking-wider mt-0.5 uppercase font-semibold">Poultry Farm Management</p>
            </div>
          </div>

          {/* User Status / Info Badge */}
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-3xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
              📅 Today: <span className="font-bold text-slate-700 dark:text-slate-200">2026-07-15</span>
            </span>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0"
              id="btn-dark-mode-toggle"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 text-right">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Session Admin</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">mu68383637@gmail.com</span>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                title="Open App Settings"
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs cursor-pointer border transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-green-700 text-white border-green-800' 
                    : 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-900'
                }`}
              >
                PF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Horizontal Tab Navigation Bar (replaces sidebar) */}
      <nav
        className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 z-30 px-2 sm:px-6 shadow-xs transition-colors duration-200"
        id="tab-navigation"
      >
        <div className="max-w-7xl w-full mx-auto flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'flock', label: 'Flock Registry', icon: BirdIcon },
            { id: 'ledger', label: 'Financial Ledger', icon: DollarSign },
            { id: 'health', label: 'Health Portal', icon: HeartPulse },
            { id: 'summary', label: 'Monthly Summaries', icon: CalendarRange },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-semibold tracking-tight transition cursor-pointer whitespace-nowrap shrink-0 border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-green-700 text-green-700 dark:text-green-400 dark:border-green-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
              id={`nav-${id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area (full width, no sidebar) */}
      <div className="max-w-7xl w-full mx-auto p-3 sm:p-6 flex-1 flex flex-col gap-4 md:gap-6">
        {/* Content Box Container */}
        <main className="flex-1 bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs min-w-0 transition-colors duration-200" id="main-content-window">
          {activeTab === 'dashboard' && (
            <Dashboard 
              birds={birds}
              otherExpenses={otherExpenses}
              feedRecords={feedRecords}
              eggProduction={eggProduction}
              settings={settings}
              openQuickAction={handleQuickAction}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'flock' && (
            <FlockRegister 
              birds={birds}
              onAddBird={handleAddBird}
              onUpdateBird={handleUpdateBird}
              onDeleteBird={handleDeleteBird}
              shouldOpenAddModal={shouldOpenAddBirdModal}
              onCloseAddModal={() => setShouldOpenAddBirdModal(false)}
              vaccinationIntervalDays={settings.vaccinationIntervalDays}
            />
          )}

          {activeTab === 'ledger' && (
            <FinancialLedger 
              feedRecords={feedRecords}
              otherExpenses={otherExpenses}
              eggProduction={eggProduction}
              settings={settings}
              onAddFeedRecord={handleAddFeedRecord}
              onDeleteFeedRecord={handleDeleteFeedRecord}
              onAddOtherExpense={handleAddOtherExpense}
              onDeleteOtherExpense={handleDeleteOtherExpense}
              onAddEggRecord={handleAddEggRecord}
              onDeleteEggRecord={handleDeleteEggRecord}
              quickOpenTab={quickOpenLedgerTab}
              onResetQuickOpenTab={() => setQuickOpenLedgerTab(null)}
            />
          )}

          {activeTab === 'health' && (
            <HealthPortal 
              birds={birds}
              vaccinationIntervalDays={settings.vaccinationIntervalDays}
              onUpdateBird={handleUpdateBird}
            />
          )}

          {activeTab === 'summary' && (
            <MonthlySummary 
              birds={birds}
              otherExpenses={otherExpenses}
              feedRecords={feedRecords}
              eggProduction={eggProduction}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel 
              settings={settings}
              onSaveSettings={setSettings}
              onResetDatabase={handleResetDatabase}
              onClearDatabase={handleClearDatabase}
              onImportRealFarmData={handleImportRealFarmData}
            />
          )}
        </main>
      </div>

      {/* Small Legal / Footer */}
      <footer className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-center py-4 text-4xs font-mono border-t border-slate-200 dark:border-slate-800 shadow-xs mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-2">
          <span>Poultry Farm Management System &copy; 2026. All rights reserved.</span>
          <span>Crafted for mu68383637@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
