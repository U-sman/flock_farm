import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Bird as BirdIcon,
  DollarSign,
  HeartPulse,
  CalendarRange,
  Settings as SettingsIcon,
  Activity,
  Egg,
  Moon,
  Sun,
  ClipboardList,
  Users,
  Languages,
  Shield,
} from 'lucide-react';

import {
  INITIAL_SETTINGS,
  INITIAL_BIRDS,
  INITIAL_EXPENSES,
  INITIAL_FEED_RECORDS,
  INITIAL_EGG_PRODUCTION,
  INITIAL_BATCHES,
  INITIAL_VACCINATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_SALES,
  INITIAL_INCUBATION,
} from './initialData';

import {
  Bird,
  OtherExpense,
  FeedRecord,
  EggProduction,
  GlobalSettings,
  BirdBatch,
  VaccinationRecord,
  Customer,
  CustomerSale,
  IncubationRecord,
  DailyChecklistEntry,
  DiaryEntry,
  UserRole,
  Lang,
  DateRange,
} from './types';

import Dashboard from './components/Dashboard';
import FlockRegister from './components/FlockRegister';
import FinancialLedger from './components/FinancialLedger';
import HealthPortal from './components/HealthPortal';
import MonthlySummary from './components/MonthlySummary';
import SettingsPanel from './components/SettingsPanel';
import IncubationModule from './components/IncubationModule';
import CustomerLedger from './components/CustomerLedger';
import DailyChecklist from './components/DailyChecklist';
import DiaryNotes from './components/DiaryNotes';
import BatchManager from './components/BatchManager';
import SyncIndicator from './components/SyncIndicator';
import { loadData } from './api';
import { useDebouncedSave, mergeSyncStatus } from './hooks/useDebouncedSave';
import { t } from './i18n';
import { todayStr, monthStartStr, daysAgoStr } from './utils/calculations';

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem('flockfarm_dark_mode') === 'true');
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('flockfarm_lang') as Lang) || 'en');
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('flockfarm_role') as UserRole) || 'admin');

  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [rangeFrom, setRangeFrom] = useState(daysAgoStr(30));
  const [rangeTo, setRangeTo] = useState(todayStr());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('flockfarm_dark_mode', String(isDark));
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('flockfarm_lang', lang);
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('flockfarm_role', role);
  }, [role]);

  const [birds, setBirds] = useState<Bird[]>(INITIAL_BIRDS);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(INITIAL_EXPENSES);
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>(INITIAL_FEED_RECORDS);
  const [eggProduction, setEggProduction] = useState<EggProduction[]>(INITIAL_EGG_PRODUCTION);
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);
  const [batches, setBatches] = useState<BirdBatch[]>(INITIAL_BATCHES);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(INITIAL_VACCINATIONS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerSales, setCustomerSales] = useState<CustomerSale[]>(INITIAL_CUSTOMER_SALES);
  const [incubation, setIncubation] = useState<IncubationRecord[]>(INITIAL_INCUBATION);
  const [checklist, setChecklist] = useState<DailyChecklistEntry[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [
        b, e, f, eg, s, bat, vac, cust, cs, inc, chk, dia,
      ] = await Promise.all([
        loadData<Bird[]>('birds', INITIAL_BIRDS),
        loadData<OtherExpense[]>('expenses', INITIAL_EXPENSES),
        loadData<FeedRecord[]>('feed', INITIAL_FEED_RECORDS),
        loadData<EggProduction[]>('eggs', INITIAL_EGG_PRODUCTION),
        loadData<GlobalSettings>('settings', INITIAL_SETTINGS),
        loadData<BirdBatch[]>('batches', INITIAL_BATCHES),
        loadData<VaccinationRecord[]>('vaccinations', INITIAL_VACCINATIONS),
        loadData<Customer[]>('customers', INITIAL_CUSTOMERS),
        loadData<CustomerSale[]>('customerSales', INITIAL_CUSTOMER_SALES),
        loadData<IncubationRecord[]>('incubation', INITIAL_INCUBATION),
        loadData<DailyChecklistEntry[]>('checklist', []),
        loadData<DiaryEntry[]>('diary', []),
      ]);
      setBirds(b);
      setOtherExpenses(e);
      setFeedRecords(f);
      setEggProduction(eg);
      setSettings(s);
      setBatches(bat);
      setVaccinations(vac);
      setCustomers(cust);
      setCustomerSales(cs);
      setIncubation(inc);
      setChecklist(chk);
      setDiary(dia);
      setIsLoaded(true);
    })();
  }, []);

  const sBirds = useDebouncedSave('birds', birds, isLoaded);
  const sExpenses = useDebouncedSave('expenses', otherExpenses, isLoaded);
  const sFeed = useDebouncedSave('feed', feedRecords, isLoaded);
  const sEggs = useDebouncedSave('eggs', eggProduction, isLoaded);
  const sSettings = useDebouncedSave('settings', settings, isLoaded);
  const sBatches = useDebouncedSave('batches', batches, isLoaded);
  const sVaccinations = useDebouncedSave('vaccinations', vaccinations, isLoaded);
  const sCustomers = useDebouncedSave('customers', customers, isLoaded);
  const sCustomerSales = useDebouncedSave('customerSales', customerSales, isLoaded);
  const sIncubation = useDebouncedSave('incubation', incubation, isLoaded);
  const sChecklist = useDebouncedSave('checklist', checklist, isLoaded);
  const sDiary = useDebouncedSave('diary', diary, isLoaded);

  const syncStatus = mergeSyncStatus([
    sBirds, sExpenses, sFeed, sEggs, sSettings, sBatches,
    sVaccinations, sCustomers, sCustomerSales, sIncubation, sChecklist, sDiary,
  ]);

  const isAdmin = role === 'admin';
  const canDelete = isAdmin;

  const handleRoleSwitch = (newRole: UserRole) => {
    if (newRole === 'admin' && role !== 'admin') {
      const pin = prompt('Enter admin PIN:');
      if (pin !== (settings.adminPin || '1234')) {
        alert('Wrong PIN');
        return;
      }
    }
    setRole(newRole);
  };

  const handleDatePreset = (preset: 'all' | 'month' | '30d') => {
    if (preset === 'all') {
      setDateRange(null);
      setRangeFrom('2020-01-01');
      setRangeTo(todayStr());
    } else if (preset === 'month') {
      const from = monthStartStr();
      const to = todayStr();
      setDateRange({ from, to });
      setRangeFrom(from);
      setRangeTo(to);
    } else {
      const from = daysAgoStr(30);
      const to = todayStr();
      setDateRange({ from, to });
      setRangeFrom(from);
      setRangeTo(to);
    }
  };

  const effectiveRange = useMemo<DateRange | null>(() => {
    if (!dateRange) return null;
    return dateRange;
  }, [dateRange]);

  const handleResetDatabase = () => {
    if (!isAdmin) return;
    setBirds(INITIAL_BIRDS);
    setOtherExpenses(INITIAL_EXPENSES);
    setFeedRecords(INITIAL_FEED_RECORDS);
    setEggProduction(INITIAL_EGG_PRODUCTION);
    setSettings(INITIAL_SETTINGS);
    setBatches(INITIAL_BATCHES);
    setVaccinations(INITIAL_VACCINATIONS);
    setCustomers(INITIAL_CUSTOMERS);
    setCustomerSales(INITIAL_CUSTOMER_SALES);
    setIncubation(INITIAL_INCUBATION);
    setChecklist([]);
    setDiary([]);
  };

  const handleClearDatabase = () => {
    if (!isAdmin) return;
    setBirds([]);
    setOtherExpenses([]);
    setFeedRecords([]);
    setEggProduction([]);
    setSettings({ defaultPricePerEgg: 25, vaccinationIntervalDays: 30, feedLowStockDays: 14, feedConsumptionKgPerDay: 2 });
    setBatches([]);
    setVaccinations([]);
    setCustomers([]);
    setCustomerSales([]);
    setIncubation([]);
    setChecklist([]);
    setDiary([]);
  };

  const handleRestoreBackup = (data: Record<string, unknown>) => {
    if (!isAdmin) return;
    if (data.birds) setBirds(data.birds as Bird[]);
    if (data.otherExpenses) setOtherExpenses(data.otherExpenses as OtherExpense[]);
    if (data.feedRecords) setFeedRecords(data.feedRecords as FeedRecord[]);
    if (data.eggProduction) setEggProduction(data.eggProduction as EggProduction[]);
    if (data.settings) setSettings(data.settings as GlobalSettings);
    if (data.batches) setBatches(data.batches as BirdBatch[]);
    if (data.vaccinations) setVaccinations(data.vaccinations as VaccinationRecord[]);
    if (data.customers) setCustomers(data.customers as Customer[]);
    if (data.customerSales) setCustomerSales(data.customerSales as CustomerSale[]);
    if (data.incubation) setIncubation(data.incubation as IncubationRecord[]);
    if (data.checklist) setChecklist(data.checklist as DailyChecklistEntry[]);
    if (data.diary) setDiary(data.diary as DiaryEntry[]);
  };

  const handleAddBird = (newBird: Omit<Bird, 'id'>) => {
    setBirds([...birds, { ...newBird, id: nextId(birds) }]);
  };
  const handleUpdateBird = (id: number, updatedBird: Bird) => {
    setBirds(birds.map((b) => (b.id === id ? updatedBird : b)));
  };
  const handleDeleteBird = (id: number) => {
    if (!canDelete) return;
    setBirds(birds.filter((b) => b.id !== id));
  };

  const handleAddOtherExpense = (newExp: Omit<OtherExpense, 'id'>) => {
    if (!isAdmin) return;
    setOtherExpenses([...otherExpenses, { ...newExp, id: nextId(otherExpenses) }]);
  };
  const handleUpdateOtherExpense = (id: number, exp: OtherExpense) => {
    if (!isAdmin) return;
    setOtherExpenses(otherExpenses.map((o) => (o.id === id ? exp : o)));
  };
  const handleDeleteOtherExpense = (id: number) => {
    if (!canDelete) return;
    setOtherExpenses(otherExpenses.filter((o) => o.id !== id));
  };

  const handleAddFeedRecord = (newFeed: Omit<FeedRecord, 'id'>) => {
    setFeedRecords([...feedRecords, { ...newFeed, id: nextId(feedRecords) }]);
  };
  const handleUpdateFeedRecord = (id: number, feed: FeedRecord) => {
    setFeedRecords(feedRecords.map((f) => (f.id === id ? feed : f)));
  };
  const handleDeleteFeedRecord = (id: number) => {
    if (!canDelete) return;
    setFeedRecords(feedRecords.filter((f) => f.id !== id));
  };

  const handleAddEggRecord = (newEgg: EggProduction) => {
    const exists = eggProduction.some((ep) => ep.date === newEgg.date);
    if (exists) {
      setEggProduction(eggProduction.map((ep) => (ep.date === newEgg.date ? newEgg : ep)));
    } else {
      setEggProduction([...eggProduction, newEgg]);
    }
  };
  const handleUpdateEggRecord = (date: string, egg: EggProduction) => {
    setEggProduction(eggProduction.map((ep) => (ep.date === date ? egg : ep)));
  };
  const handleDeleteEggRecord = (date: string) => {
    if (!canDelete) return;
    setEggProduction(eggProduction.filter((ep) => ep.date !== date));
  };

  const handleAddVaccination = (v: Omit<VaccinationRecord, 'id'>) => {
    const record = { ...v, id: nextId(vaccinations) };
    setVaccinations([...vaccinations, record]);
    setBirds(birds.map((b) => (b.id === v.birdId ? { ...b, lastVaccinationDate: v.date } : b)));
  };
  const handleDeleteVaccination = (id: number) => {
    if (!canDelete) return;
    setVaccinations(vaccinations.filter((v) => v.id !== id));
  };

  const handleAddBatch = (b: Omit<BirdBatch, 'id'>) => {
    if (!isAdmin) return;
    setBatches([...batches, { ...b, id: nextId(batches) }]);
  };
  const handleDeleteBatch = (id: number) => {
    if (!canDelete) return;
    setBatches(batches.filter((b) => b.id !== id));
  };

  const handleAddCustomer = (c: Omit<Customer, 'id'>) => {
    if (!isAdmin) return;
    setCustomers([...customers, { ...c, id: nextId(customers) }]);
  };
  const handleUpdateCustomer = (id: number, c: Customer) => {
    if (!isAdmin) return;
    setCustomers(customers.map((x) => (x.id === id ? c : x)));
  };
  const handleDeleteCustomer = (id: number) => {
    if (!canDelete) return;
    setCustomers(customers.filter((c) => c.id !== id));
  };
  const handleAddCustomerSale = (s: Omit<CustomerSale, 'id'>) => {
    if (!isAdmin) return;
    setCustomerSales([...customerSales, { ...s, id: nextId(customerSales) }]);
  };
  const handleUpdateCustomerSale = (id: number, s: CustomerSale) => {
    if (!isAdmin) return;
    setCustomerSales(customerSales.map((x) => (x.id === id ? s : x)));
  };
  const handleDeleteCustomerSale = (id: number) => {
    if (!canDelete) return;
    setCustomerSales(customerSales.filter((s) => s.id !== id));
  };

  const handleAddIncubation = (r: Omit<IncubationRecord, 'id'>) => {
    if (!isAdmin) return;
    setIncubation([...incubation, { ...r, id: nextId(incubation) }]);
  };
  const handleUpdateIncubation = (id: number, r: IncubationRecord) => {
    if (!isAdmin) return;
    setIncubation(incubation.map((x) => (x.id === id ? r : x)));
  };
  const handleDeleteIncubation = (id: number) => {
    if (!canDelete) return;
    setIncubation(incubation.filter((r) => r.id !== id));
  };

  const handleSaveChecklist = (entry: DailyChecklistEntry) => {
    const exists = checklist.some((c) => c.date === entry.date);
    if (exists) {
      setChecklist(checklist.map((c) => (c.date === entry.date ? entry : c)));
    } else {
      setChecklist([...checklist, entry]);
    }
  };

  const handleSaveDiary = (entry: DiaryEntry) => {
    const exists = diary.some((d) => d.date === entry.date);
    if (exists) {
      setDiary(diary.map((d) => (d.date === entry.date ? entry : d)));
    } else {
      setDiary([...diary, entry]);
    }
  };

  const [shouldOpenAddBirdModal, setShouldOpenAddBirdModal] = useState(false);
  const [quickOpenLedgerTab, setQuickOpenLedgerTab] = useState<'feed' | 'expense' | 'egg' | 'customers' | null>(null);

  const handleQuickAction = (actionType: 'bird' | 'egg' | 'expense' | 'feed') => {
    if (actionType === 'bird') {
      if (!isAdmin) return;
      setActiveTab('flock');
      setShouldOpenAddBirdModal(true);
    } else if (actionType === 'egg') {
      setActiveTab('ledger');
      setQuickOpenLedgerTab('egg');
    } else if (actionType === 'expense') {
      if (!isAdmin) return;
      setActiveTab('ledger');
      setQuickOpenLedgerTab('expense');
    } else if (actionType === 'feed') {
      setActiveTab('ledger');
      setQuickOpenLedgerTab('feed');
    }
  };

  const navItems = [
    { id: 'dashboard', label: t(lang, 'dashboard'), icon: LayoutDashboard },
    { id: 'flock', label: t(lang, 'flock'), icon: BirdIcon },
    { id: 'ledger', label: t(lang, 'ledger'), icon: DollarSign },
    { id: 'customers', label: t(lang, 'customers'), icon: Users },
    { id: 'health', label: t(lang, 'health'), icon: HeartPulse },
    { id: 'incubation', label: t(lang, 'incubation'), icon: Egg },
    { id: 'operations', label: t(lang, 'operations'), icon: ClipboardList },
    { id: 'summary', label: t(lang, 'summary'), icon: CalendarRange },
    ...(isAdmin ? [{ id: 'settings', label: t(lang, 'settings'), icon: SettingsIcon }] : []),
  ];

  const today = todayStr();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200" id="app-root">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-2.5 h-14 flex items-center justify-between shadow-xs transition-colors duration-200">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0">
              <BirdIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold font-display tracking-tight text-slate-800 dark:text-slate-100">
                {t(lang, 'appName')}
              </h1>
              <p className="hidden md:block text-4xs text-slate-400 dark:text-slate-500 font-mono tracking-wider mt-0.5 uppercase font-semibold">
                {t(lang, 'appSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <span className="hidden md:inline bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-3xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
              📅 {t(lang, 'today')}: <span className="font-bold text-slate-700 dark:text-slate-200">{today}</span>
            </span>

            <SyncIndicator status={syncStatus} lang={lang} />

            <button
              onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
              title="Language"
              className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition shrink-0"
            >
              <Languages className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition shrink-0"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <select
              value={role}
              onChange={(e) => handleRoleSwitch(e.target.value as UserRole)}
              className="hidden sm:block text-3xs font-semibold px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
              title="Role"
            >
              <option value="admin">{t(lang, 'roleAdmin')}</option>
              <option value="worker">{t(lang, 'roleWorker')}</option>
            </select>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs cursor-pointer border transition-all ${
                  activeTab === 'settings'
                    ? 'bg-green-700 text-white border-green-800'
                    : 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900'
                }`}
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 z-30 px-2 sm:px-6 shadow-xs" id="tab-navigation">
        <div className="max-w-7xl w-full mx-auto flex gap-1 overflow-x-auto no-scrollbar">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-semibold tracking-tight transition cursor-pointer whitespace-nowrap shrink-0 border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-green-700 text-green-700 dark:text-green-400 dark:border-green-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              id={`nav-${id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl w-full mx-auto p-3 sm:p-6 flex-1 flex flex-col gap-4 md:gap-6">
        <main className="flex-1 bg-white dark:bg-slate-900 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs min-w-0" id="main-content-window">
          {!isLoaded ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading farm data…</div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  lang={lang}
                  birds={birds}
                  otherExpenses={otherExpenses}
                  feedRecords={feedRecords}
                  eggProduction={eggProduction}
                  settings={settings}
                  dateRange={effectiveRange}
                  rangeFrom={rangeFrom}
                  rangeTo={rangeTo}
                  onDateRangeChange={(from, to) => {
                    setRangeFrom(from);
                    setRangeTo(to);
                    setDateRange({ from, to });
                  }}
                  onDatePreset={handleDatePreset}
                  openQuickAction={handleQuickAction}
                  onNavigate={setActiveTab}
                  isAdmin={isAdmin}
                />
              )}

              {activeTab === 'flock' && (
                <div className="space-y-6">
                  {isAdmin && (
                    <BatchManager
                      lang={lang}
                      batches={batches}
                      onAdd={handleAddBatch}
                      onDelete={handleDeleteBatch}
                      canDelete={canDelete}
                    />
                  )}
                  <FlockRegister
                    lang={lang}
                    birds={birds}
                    batches={batches}
                    onAddBird={handleAddBird}
                    onUpdateBird={handleUpdateBird}
                    onDeleteBird={handleDeleteBird}
                    shouldOpenAddModal={shouldOpenAddBirdModal}
                    onCloseAddModal={() => setShouldOpenAddBirdModal(false)}
                    vaccinationIntervalDays={settings.vaccinationIntervalDays}
                    canDelete={canDelete}
                    isAdmin={isAdmin}
                  />
                </div>
              )}

              {activeTab === 'ledger' && (
                <FinancialLedger
                  lang={lang}
                  feedRecords={feedRecords}
                  otherExpenses={otherExpenses}
                  eggProduction={eggProduction}
                  settings={settings}
                  onAddFeedRecord={handleAddFeedRecord}
                  onUpdateFeedRecord={handleUpdateFeedRecord}
                  onDeleteFeedRecord={handleDeleteFeedRecord}
                  onAddOtherExpense={handleAddOtherExpense}
                  onUpdateOtherExpense={handleUpdateOtherExpense}
                  onDeleteOtherExpense={handleDeleteOtherExpense}
                  onAddEggRecord={handleAddEggRecord}
                  onUpdateEggRecord={handleUpdateEggRecord}
                  onDeleteEggRecord={handleDeleteEggRecord}
                  quickOpenTab={quickOpenLedgerTab}
                  onResetQuickOpenTab={() => setQuickOpenLedgerTab(null)}
                  canDelete={canDelete}
                  isAdmin={isAdmin}
                />
              )}

              {activeTab === 'customers' && (
                <CustomerLedger
                  lang={lang}
                  customers={customers}
                  sales={customerSales}
                  defaultPricePerEgg={settings.defaultPricePerEgg}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onAddSale={handleAddCustomerSale}
                  onUpdateSale={handleUpdateCustomerSale}
                  onDeleteSale={handleDeleteCustomerSale}
                  canDelete={canDelete}
                />
              )}

              {activeTab === 'health' && (
                <HealthPortal
                  lang={lang}
                  birds={birds}
                  vaccinations={vaccinations}
                  vaccinationIntervalDays={settings.vaccinationIntervalDays}
                  onUpdateBird={handleUpdateBird}
                  onAddVaccination={handleAddVaccination}
                  onDeleteVaccination={handleDeleteVaccination}
                  canDelete={canDelete}
                  isAdmin={isAdmin}
                />
              )}

              {activeTab === 'incubation' && (
                <IncubationModule
                  lang={lang}
                  records={incubation}
                  batches={batches}
                  onAdd={handleAddIncubation}
                  onUpdate={handleUpdateIncubation}
                  onDelete={handleDeleteIncubation}
                  canDelete={canDelete}
                />
              )}

              {activeTab === 'operations' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DailyChecklist lang={lang} entries={checklist} onSave={handleSaveChecklist} readOnly={false} />
                  <DiaryNotes lang={lang} entries={diary} onSave={handleSaveDiary} readOnly={false} />
                </div>
              )}

              {activeTab === 'summary' && (
                <MonthlySummary
                  lang={lang}
                  birds={birds}
                  otherExpenses={otherExpenses}
                  feedRecords={feedRecords}
                  eggProduction={eggProduction}
                  settings={settings}
                  dateRange={effectiveRange}
                  rangeFrom={rangeFrom}
                  rangeTo={rangeTo}
                  onDateRangeChange={(from, to) => {
                    setRangeFrom(from);
                    setRangeTo(to);
                    setDateRange({ from, to });
                  }}
                  onDatePreset={handleDatePreset}
                />
              )}

              {activeTab === 'settings' && isAdmin && (
                <SettingsPanel
                  lang={lang}
                  settings={settings}
                  birds={birds}
                  otherExpenses={otherExpenses}
                  feedRecords={feedRecords}
                  eggProduction={eggProduction}
                  batches={batches}
                  vaccinations={vaccinations}
                  customers={customers}
                  customerSales={customerSales}
                  incubation={incubation}
                  checklist={checklist}
                  diary={diary}
                  onSaveSettings={setSettings}
                  onResetDatabase={handleResetDatabase}
                  onClearDatabase={handleClearDatabase}
                  onRestoreBackup={handleRestoreBackup}
                />
              )}
            </>
          )}
        </main>
      </div>

      <footer className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-center py-4 text-4xs font-mono border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-2">
          <span>Poultry Farm Management System © 2026</span>
          <span className="capitalize">{role} mode</span>
        </div>
      </footer>
    </div>
  );
}
