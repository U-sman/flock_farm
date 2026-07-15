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
  Egg
} from 'lucide-react';

import { 
  INITIAL_SETTINGS, 
  INITIAL_BIRDS, 
  INITIAL_EXPENSES, 
  INITIAL_FEED_RECORDS, 
  INITIAL_EGG_PRODUCTION 
} from './initialData';

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root">
      {/* Top Application Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5 h-14 flex items-center justify-between shadow-xs">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0">
              <BirdIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold font-display tracking-tight flex items-center gap-1 text-slate-800">
                FeatherFlow <span className="text-indigo-600 italic font-bold">ERP</span>
              </h1>
              <p className="hidden md:block text-4xs text-slate-400 font-mono tracking-wider mt-0.5 uppercase font-semibold">Commercial Flocks & Financial Accounts Engine</p>
            </div>
          </div>

          {/* User Status / Info Badge */}
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-3xs font-mono text-slate-500 font-semibold">
              📅 Today: <span className="font-bold text-slate-700">2026-07-15</span>
            </span>
            <div className="flex items-center gap-2 text-right">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Session Admin</span>
                <span className="text-xs font-semibold text-slate-700">mu68383637@gmail.com</span>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                title="Open App Settings"
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs cursor-pointer border transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-indigo-600 text-white border-indigo-700' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
                }`}
              >
                PF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid Layout */}
      <div className="max-w-7xl w-full mx-auto p-3 sm:p-6 flex-1 flex flex-col md:flex-row gap-4 md:gap-6 pb-20 md:pb-6">
        {/* Navigation Rail Container */}
        <nav className="hidden md:flex md:w-64 shrink-0 bg-white p-4 rounded-2xl border border-slate-200 flex-col gap-1.5 shadow-xs h-fit sticky top-20 z-30" id="sidebar-navigation">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer w-full text-left shrink-0 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
            id="nav-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Live KPI Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('flock')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer w-full text-left shrink-0 ${
              activeTab === 'flock' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
            id="nav-flock"
          >
            <BirdIcon className="w-4 h-4" />
            <span>Flock Registry</span>
          </button>

          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer w-full text-left shrink-0 ${
              activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
            id="nav-ledger"
          >
            <DollarSign className="w-4 h-4" />
            <span>Financial Ledger</span>
          </button>

          <button 
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer w-full text-left shrink-0 ${
              activeTab === 'health' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
            id="nav-health"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Health Portal</span>
          </button>

          <button 
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer w-full text-left shrink-0 ${
              activeTab === 'summary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
            id="nav-summary"
          >
            <CalendarRange className="w-4 h-4" />
            <span>Monthly Summaries</span>
          </button>

          <div className="border-t border-slate-100 my-2 pt-2 hidden md:block" />

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition cursor-pointer w-full text-left shrink-0 ${
              activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
            id="nav-settings"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>App Settings</span>
          </button>
        </nav>

        {/* Content Box Container */}
        <main className="flex-1 bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs min-w-0" id="main-content-window">
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
            />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center py-2 px-1 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]" id="mobile-navigation">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-600 scale-105' : 'text-slate-400'
          }`}
          id="btn-mob-nav-dashboard"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab('flock')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeTab === 'flock' ? 'text-indigo-600 scale-105' : 'text-slate-400'
          }`}
          id="btn-mob-nav-flock"
        >
          <BirdIcon className="w-5 h-5" />
          <span>Registry</span>
        </button>

        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeTab === 'ledger' ? 'text-indigo-600 scale-105' : 'text-slate-400'
          }`}
          id="btn-mob-nav-ledger"
        >
          <DollarSign className="w-5 h-5" />
          <span>Ledger</span>
        </button>

        <button 
          onClick={() => setActiveTab('health')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeTab === 'health' ? 'text-indigo-600 scale-105' : 'text-slate-400'
          }`}
          id="btn-mob-nav-health"
        >
          <HeartPulse className="w-5 h-5" />
          <span>Health</span>
        </button>

        <button 
          onClick={() => setActiveTab('summary')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeTab === 'summary' ? 'text-indigo-600 scale-105' : 'text-slate-400'
          }`}
          id="btn-mob-nav-summary"
        >
          <CalendarRange className="w-5 h-5" />
          <span>Summary</span>
        </button>
      </nav>

      {/* Small Legal / Footer */}
      <footer className="bg-white text-slate-400 text-center py-4 text-4xs font-mono border-t border-slate-200 shadow-xs mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-2">
          <span>Poultry Farm Management System &copy; 2026. All rights reserved.</span>
          <span>Crafted for mu68383637@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
