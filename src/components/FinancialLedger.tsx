import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Egg, 
  ShoppingBag, 
  Scale, 
  Coins, 
  Search, 
  ArrowUpDown,
  TrendingDown,
  ChevronDown,
  Info
} from 'lucide-react';
import { FeedRecord, OtherExpense, EggProduction, FeedType, ExpenseCategory, GlobalSettings } from '../types';

interface FinancialLedgerProps {
  feedRecords: FeedRecord[];
  otherExpenses: OtherExpense[];
  eggProduction: EggProduction[];
  settings: GlobalSettings;
  onAddFeedRecord: (record: Omit<FeedRecord, 'id'>) => void;
  onDeleteFeedRecord: (id: number) => void;
  onAddOtherExpense: (expense: Omit<OtherExpense, 'id'>) => void;
  onDeleteOtherExpense: (id: number) => void;
  onAddEggRecord: (record: EggProduction) => void;
  onDeleteEggRecord: (date: string) => void;
  quickOpenTab: 'feed' | 'expense' | 'egg' | null;
  onResetQuickOpenTab: () => void;
}

export default function FinancialLedger({
  feedRecords,
  otherExpenses,
  eggProduction,
  settings,
  onAddFeedRecord,
  onDeleteFeedRecord,
  onAddOtherExpense,
  onDeleteOtherExpense,
  onAddEggRecord,
  onDeleteEggRecord,
  quickOpenTab,
  onResetQuickOpenTab
}: FinancialLedgerProps) {
  // Main Sub-tabs: 'feed' | 'expense' | 'egg'
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'expense' | 'egg'>('feed');

  // Sync quickOpenTab prop from parent (e.g. Dashboard quick actions)
  useEffect(() => {
    if (quickOpenTab) {
      if (quickOpenTab === 'feed') setActiveSubTab('feed');
      if (quickOpenTab === 'expense') setActiveSubTab('expense');
      if (quickOpenTab === 'egg') setActiveSubTab('egg');
      onResetQuickOpenTab();
    }
  }, [quickOpenTab]);

  // Form states - Feed
  const [feedDate, setFeedDate] = useState(new Date().toISOString().split('T')[0]);
  const [feedType, setFeedType] = useState<FeedType>('Khal & Choker');
  const [feedQty, setFeedQty] = useState('');
  const [feedRate, setFeedRate] = useState('');
  const [feedNotes, setFeedNotes] = useState('');

  // Form states - Expense
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDetail, setExpDetail] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Medicine');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Form states - Egg
  const [eggDate, setEggDate] = useState(new Date().toISOString().split('T')[0]);
  const [eggsCollected, setEggsCollected] = useState('');
  const [eggsSold, setEggsSold] = useState('');
  const [eggsHomeUse, setEggsHomeUse] = useState('');
  const [eggsBroken, setEggsBroken] = useState('');

  // Search terms for filters
  const [feedSearch, setFeedSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [eggSearch, setEggSearch] = useState('');

  // Submit Feed Record
  const handleFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(feedQty);
    const rate = parseFloat(feedRate);
    if (!qty || qty <= 0 || !rate || rate <= 0) {
      return alert('Please enter valid quantity and rate');
    }
    onAddFeedRecord({
      date: feedDate,
      feedType,
      quantityKg: qty,
      rateRsPerKg: rate,
      notes: feedNotes.trim() || undefined
    });
    // Reset Form
    setFeedQty('');
    setFeedRate('');
    setFeedNotes('');
  };

  // Submit Expense Record
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!expDetail.trim()) return alert('Please enter expense detail');
    if (!amt || amt <= 0) return alert('Please enter a valid amount');

    onAddOtherExpense({
      date: expDate,
      detail: expDetail.trim(),
      category: expCategory,
      amount: amt,
      notes: expNotes.trim() || undefined
    });
    // Reset Form
    setExpDetail('');
    setExpAmount('');
    setExpNotes('');
  };

  // Submit Egg Production Record
  const handleEggSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const col = parseInt(eggsCollected) || 0;
    const sold = parseInt(eggsSold) || 0;
    const home = parseInt(eggsHomeUse) || 0;
    const brok = parseInt(eggsBroken) || 0;

    if (col < 0 || sold < 0 || home < 0 || brok < 0) {
      return alert('Values cannot be negative');
    }

    if (sold + home + brok > col) {
      return alert(`Sum of Sold (${sold}), Home Use (${home}), and Broken (${brok}) cannot exceed Total Eggs Collected (${col})`);
    }

    // Check if egg record already exists for this date
    const exists = eggProduction.some(ep => ep.date === eggDate);
    if (exists) {
      if (!confirm(`An egg production log already exists for date ${eggDate}. Do you want to update it with these new values?`)) {
        return;
      }
    }

    onAddEggRecord({
      date: eggDate,
      totalEggsCollected: col,
      sold,
      homeUse: home,
      brokenWasted: brok
    });

    // Reset Form
    setEggsCollected('');
    setEggsSold('');
    setEggsHomeUse('');
    setEggsBroken('');
  };

  // Calculations for Summary Badges
  const totalFeedExpense = feedRecords.reduce((sum, f) => sum + (f.quantityKg * f.rateRsPerKg), 0);
  const totalFeedWeight = feedRecords.reduce((sum, f) => sum + f.quantityKg, 0);

  const totalOtherExpensesSum = otherExpenses.reduce((sum, o) => sum + o.amount, 0);

  const totalEggsCollectedSum = eggProduction.reduce((sum, ep) => sum + ep.totalEggsCollected, 0);
  const totalEggsSoldSum = eggProduction.reduce((sum, ep) => sum + ep.sold, 0);
  const totalEggsHomeSum = eggProduction.reduce((sum, ep) => sum + ep.homeUse, 0);
  const totalEggsBrokenSum = eggProduction.reduce((sum, ep) => sum + ep.brokenWasted, 0);
  const totalEggIncome = totalEggsSoldSum * settings.defaultPricePerEgg;

  return (
    <div className="space-y-6" id="financial-ledger-tab">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800">Financial Ledger</h2>
        <p className="text-xs text-slate-500">Log feed purchases, operating expenses, and daily egg outputs to build profit & loss reports.</p>
      </div>

      {/* Primary Sub Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveSubTab('feed')}
          className={`px-4 py-3 text-xs font-bold font-display tracking-tight border-b-2 -mb-px transition cursor-pointer ${
            activeSubTab === 'feed' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="btn-ledger-feed-tab"
        >
          Feed records ({feedRecords.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('expense')}
          className={`px-4 py-3 text-xs font-bold font-display tracking-tight border-b-2 -mb-px transition cursor-pointer ${
            activeSubTab === 'expense' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="btn-ledger-expense-tab"
        >
          Other Expenses ({otherExpenses.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('egg')}
          className={`px-4 py-3 text-xs font-bold font-display tracking-tight border-b-2 -mb-px transition cursor-pointer ${
            activeSubTab === 'egg' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          id="btn-ledger-eggs-tab"
        >
          Egg Production ({eggProduction.length})
        </button>
      </div>

      {/* --- FEED RECORDS SECTION --- */}
      {activeSubTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Data Entry Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Record Feed Purchase
            </h3>

            <form onSubmit={handleFeedSubmit} className="space-y-3.5 text-xs text-gray-700">
              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Purchase Date</label>
                <input 
                  type="date"
                  required
                  value={feedDate}
                  onChange={(e) => setFeedDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Feed Type</label>
                <select 
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value as FeedType)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-hidden"
                >
                  <option value="Khal & Choker">Khal & Choker</option>
                  <option value="Corn">Corn</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Grains">Grains</option>
                  <option value="Supplements">Supplements</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity (kg) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 50"
                    value={feedQty}
                    onChange={(e) => setFeedQty(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rate (Rs/kg) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 110"
                    value={feedRate}
                    onChange={(e) => setFeedRate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Automatic live multiplication display */}
              {parseFloat(feedQty) > 0 && parseFloat(feedRate) > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-900 font-mono text-2xs flex justify-between">
                  <span>Auto-Calculated Total:</span>
                  <span className="font-bold">Rs {(parseFloat(feedQty) * parseFloat(feedRate)).toLocaleString()}</span>
                </div>
              )}

              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Optional Notes</label>
                <textarea 
                  placeholder="Brand, seller, or quality details..."
                  value={feedNotes}
                  onChange={(e) => setFeedNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-hidden h-16 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Save Feed Purchase
              </button>
            </form>
          </div>

          {/* Table / List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
              <div>
                <span className="text-3xs font-bold text-amber-700 uppercase tracking-wider block font-mono">Total Feed Purchased</span>
                <span className="text-lg font-bold font-mono text-amber-900">{totalFeedWeight.toFixed(1)} kg</span>
              </div>
              <div>
                <span className="text-3xs font-bold text-amber-700 uppercase tracking-wider block font-mono">Total Feed Investment</span>
                <span className="text-lg font-bold font-mono text-amber-900">Rs {totalFeedExpense.toLocaleString()}</span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search feed records by type or notes..."
                value={feedSearch}
                onChange={(e) => setFeedSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold font-mono uppercase text-3xs tracking-wider">
                      <th className="p-3">Date</th>
                      <th className="p-3">Feed Type</th>
                      <th className="p-3">Qty (kg)</th>
                      <th className="p-3">Rate (Rs/kg)</th>
                      <th className="p-3 text-right">Total Cost</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feedRecords
                      .filter(f => f.feedType.toLowerCase().includes(feedSearch.toLowerCase()) || (f.notes && f.notes.toLowerCase().includes(feedSearch.toLowerCase())))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(record => (
                        <tr key={record.id} className="hover:bg-gray-50/50 font-medium">
                          <td className="p-3 font-mono text-gray-600 shrink-0">{record.date}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-md text-2xs font-bold">
                              {record.feedType}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-gray-800">{record.quantityKg} kg</td>
                          <td className="p-3 font-mono text-gray-500">Rs {record.rateRsPerKg}</td>
                          <td className="p-3 font-mono font-bold text-gray-900 text-right">
                            Rs {(record.quantityKg * record.rateRsPerKg).toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-500 max-w-40 truncate" title={record.notes}>
                            {record.notes || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => { if (confirm('Delete feed record?')) onDeleteFeedRecord(record.id); }}
                              className="text-gray-400 hover:text-red-600 transition p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {feedRecords.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 italic">No feed records logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- OTHER EXPENSES SECTION --- */}
      {activeSubTab === 'expense' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Data Entry Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-sm text-gray-900 font-display flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-600" /> Record Other Expense
            </h3>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs text-gray-700">
              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense Date</label>
                <input 
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expense Detail (e.g. Jali Darwazy) *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Jali Darwazy ka liya"
                  value={expDetail}
                  onChange={(e) => setExpDetail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-hidden"
                  >
                    <option value="Medicine">Medicine</option>
                    <option value="Repair">Repair</option>
                    <option value="Utility">Utility</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (Rs) *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 3500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Optional Notes</label>
                <textarea 
                  placeholder="Detailed observations or descriptions..."
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-hidden h-16 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Save Expense Record
              </button>
            </form>
          </div>

          {/* Table / List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 gap-4 bg-rose-50/50 border border-rose-100 p-4 rounded-2xl">
              <div>
                <span className="text-3xs font-bold text-rose-700 uppercase tracking-wider block font-mono">Total Other Operating Expenses</span>
                <span className="text-lg font-bold font-mono text-rose-900">Rs {totalOtherExpensesSum.toLocaleString()}</span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search operating expenses by detail or notes..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-hidden"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold font-mono uppercase text-3xs tracking-wider">
                      <th className="p-3">Date</th>
                      <th className="p-3">Detail</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {otherExpenses
                      .filter(o => o.detail.toLowerCase().includes(expenseSearch.toLowerCase()) || (o.notes && o.notes.toLowerCase().includes(expenseSearch.toLowerCase())))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(record => (
                        <tr key={record.id} className="hover:bg-gray-50/50 font-medium">
                          <td className="p-3 font-mono text-gray-600 shrink-0">{record.date}</td>
                          <td className="p-3 text-gray-900 font-semibold">{record.detail}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-md text-2xs font-bold">
                              {record.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-gray-900 text-right">
                            Rs {record.amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-500 max-w-40 truncate" title={record.notes}>
                            {record.notes || '-'}
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => { if (confirm('Delete operating expense record?')) onDeleteOtherExpense(record.id); }}
                              className="text-gray-400 hover:text-red-600 transition p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {otherExpenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400 italic">No non-feed expenses logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EGG PRODUCTION SECTION --- */}
      {activeSubTab === 'egg' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Data Entry Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-sm text-gray-900 font-display flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-600" /> Log Daily Egg Collections
            </h3>

            <form onSubmit={handleEggSubmit} className="space-y-3.5 text-xs text-gray-700">
              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Collection Date</label>
                <input 
                  type="date"
                  required
                  value={eggDate}
                  onChange={(e) => setEggDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Eggs Collected (Qty) *</label>
                <input 
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 15"
                  value={eggsCollected}
                  onChange={(e) => setEggsCollected(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sold (Qty)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={eggsSold}
                    onChange={(e) => setEggsSold(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Home Use</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={eggsHomeUse}
                    onChange={(e) => setEggsHomeUse(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold text-gray-400 uppercase tracking-wider mb-1">Broken</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={eggsBroken}
                    onChange={(e) => setEggsBroken(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Automatic live formula calculations display */}
              {parseInt(eggsCollected) >= 0 && (
                <div className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-xl text-yellow-950 font-mono text-2xs space-y-1">
                  <div className="flex justify-between">
                    <span>Remaining (In Stock):</span>
                    <span className="font-bold">
                      {parseInt(eggsCollected) - (parseInt(eggsSold) || 0) - (parseInt(eggsHomeUse) || 0) - (parseInt(eggsBroken) || 0)} eggs
                    </span>
                  </div>
                  {parseInt(eggsSold) > 0 && (
                    <div className="flex justify-between border-t border-yellow-100/50 pt-1 mt-1">
                      <span>Projected Sale Revenue:</span>
                      <span className="font-bold text-emerald-700">Rs {((parseInt(eggsSold) || 0) * settings.defaultPricePerEgg).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Log Egg Production
              </button>
            </form>
          </div>

          {/* Table / List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-yellow-50/50 border border-yellow-100 p-4 rounded-2xl">
              <div>
                <span className="text-3xs font-bold text-yellow-700 uppercase tracking-wider block font-mono">Total Collected</span>
                <span className="text-base font-bold font-mono text-yellow-900">{totalEggsCollectedSum} eggs</span>
              </div>
              <div>
                <span className="text-3xs font-bold text-yellow-700 uppercase tracking-wider block font-mono">Total Sold</span>
                <span className="text-base font-bold font-mono text-yellow-900">{totalEggsSoldSum} eggs</span>
              </div>
              <div>
                <span className="text-3xs font-bold text-yellow-700 uppercase tracking-wider block font-mono">Total Remaining</span>
                <span className="text-base font-bold font-mono text-yellow-900">
                  {totalEggsCollectedSum - totalEggsSoldSum - totalEggsHomeSum - totalEggsBrokenSum} eggs
                </span>
              </div>
              <div>
                <span className="text-3xs font-bold text-yellow-700 uppercase tracking-wider block font-mono">Commercial Income</span>
                <span className="text-base font-bold font-mono text-emerald-800">Rs {totalEggIncome.toLocaleString()}</span>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search egg records by date (YYYY-MM-DD)..."
                value={eggSearch}
                onChange={(e) => setEggSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-hidden"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold font-mono uppercase text-3xs tracking-wider">
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Collected</th>
                      <th className="p-3 text-center">Sold</th>
                      <th className="p-3 text-center">Home Use</th>
                      <th className="p-3 text-center">Wasted</th>
                      <th className="p-3 text-center">Remaining</th>
                      <th className="p-3 text-right">Income (Rs)</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {eggProduction
                      .filter(ep => ep.date.includes(eggSearch))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(record => {
                        const remaining = record.totalEggsCollected - record.sold - record.homeUse - record.brokenWasted;
                        const saleIncome = record.sold * settings.defaultPricePerEgg;
                        return (
                          <tr key={record.date} className="hover:bg-gray-50/50">
                            <td className="p-3 font-mono text-gray-600 shrink-0">{record.date}</td>
                            <td className="p-3 text-center font-mono text-gray-900 font-bold">{record.totalEggsCollected}</td>
                            <td className="p-3 text-center font-mono text-emerald-700">{record.sold}</td>
                            <td className="p-3 text-center font-mono text-blue-700">{record.homeUse}</td>
                            <td className="p-3 text-center font-mono text-rose-600">{record.brokenWasted}</td>
                            <td className="p-3 text-center font-mono text-gray-600 bg-gray-50/50">{remaining}</td>
                            <td className="p-3 font-mono font-bold text-right text-emerald-600">
                              Rs {saleIncome.toLocaleString()}
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => { if (confirm('Delete egg collection record?')) onDeleteEggRecord(record.date); }}
                                className="text-gray-400 hover:text-red-600 transition p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {eggProduction.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400 italic">No egg production records logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
