import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Activity, 
  Egg, 
  Plus, 
  AlertTriangle,
  HeartPulse,
  ShoppingBag,
  Coins,
  Settings
} from 'lucide-react';
import { Bird, OtherExpense, FeedRecord, EggProduction, GlobalSettings } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  birds: Bird[];
  otherExpenses: OtherExpense[];
  feedRecords: FeedRecord[];
  eggProduction: EggProduction[];
  settings: GlobalSettings;
  openQuickAction: (actionType: 'bird' | 'egg' | 'expense' | 'feed') => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  birds,
  otherExpenses,
  feedRecords,
  eggProduction,
  settings,
  openQuickAction,
  onNavigate
}: DashboardProps) {
  // --- 3. LIVE KPI DASHBOARD CALCULATIONS ---
  
  // Total Purchase Cost of Birds (Rs)
  const totalBirdPurchaseCost = birds.reduce((sum, bird) => sum + (bird.price || 0), 0);

  // Total Feed Cost (Rs)
  const totalFeedCost = feedRecords.reduce((sum, feed) => sum + (feed.quantityKg * feed.rateRsPerKg), 0);

  // Total Other Expenses (Rs)
  const totalOtherExpenses = otherExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Total Expense (Rs)
  const totalExpense = totalBirdPurchaseCost + totalFeedCost + totalOtherExpenses;

  // Total Income (Rs) (Sold * Default Price Per Egg)
  const totalIncome = eggProduction.reduce((sum, record) => sum + (record.sold * settings.defaultPricePerEgg), 0);

  // Net Profit / Loss (Rs)
  const netProfitLoss = totalIncome - totalExpense;

  // ROI %
  const roiPercent = totalExpense > 0 ? (netProfitLoss / totalExpense) * 100 : 0;

  // Birds Count
  const totalBirdsCount = birds.length;
  const activeBirdsCount = birds.filter(b => b.status === 'Active').length;
  const deadBirdsCount = birds.filter(b => b.status === 'Dead').length;
  const soldBirdsCount = birds.filter(b => b.status === 'Sold').length;

  // Mortality Rate %
  const mortalityRatePercent = totalBirdsCount > 0 ? (deadBirdsCount / totalBirdsCount) * 100 : 0;

  // Active Female Birds for Egg Calculations
  const activeFemaleBirdsCount = birds.filter(b => b.status === 'Active' && b.gender === 'Female').length;
  
  // Count of unique days in egg production record
  const uniqueDaysCount = eggProduction.length;
  const totalEggsCollected = eggProduction.reduce((sum, ep) => sum + ep.totalEggsCollected, 0);

  // Average Eggs/Hen/Day
  const avgEggsPerHenPerDay = (activeFemaleBirdsCount > 0 && uniqueDaysCount > 0)
    ? totalEggsCollected / (activeFemaleBirdsCount * uniqueDaysCount)
    : 0;

  // Alerts
  const showHighMortality = mortalityRatePercent > 10;
  const showFinancialDeficit = netProfitLoss < -5000;

  return (
    <div className="space-y-8" id="dashboard-tab">
      {/* Smart Alerts Engine */}
      {(showHighMortality || showFinancialDeficit) && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-400 font-mono">
            Smart Health & Financial Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showHighMortality && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800"
                id="alert-high-mortality"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">High Mortality Warning</h4>
                  <p className="text-xs text-red-700 mt-1">
                    ⚠ High mortality ({mortalityRatePercent.toFixed(1)}%) - Check health logs and vaccination statuses!
                  </p>
                </div>
              </motion.div>
            )}

            {showFinancialDeficit && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800"
                id="alert-financial-deficit"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Financial Deficit Warning</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    ⚠ Net loss exceeds Rs 5,000 (Current balance: Rs {netProfitLoss.toLocaleString()})
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* KPI Section 1: Financial Ledger overview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
            Financial Health Indicators (PKR)
          </h3>
          <span className="text-xs text-slate-500 font-mono font-medium">Egg Price: Rs {settings.defaultPricePerEgg} / egg</span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Income Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4 hover:border-slate-300 hover:shadow-sm transition duration-150 animate-in fade-in zoom-in-95 duration-150" id="kpi-total-income">
            <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">Total Income</p>
              <h4 className="text-sm sm:text-xl font-bold font-mono text-slate-800 mt-0.5 truncate">Rs {totalIncome.toLocaleString()}</h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate">Egg Sales Earnings</p>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4 hover:border-slate-300 hover:shadow-sm transition duration-150 animate-in fade-in zoom-in-95 duration-150" id="kpi-total-expense">
            <div className="p-2 sm:p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">Total Expenses</p>
              <h4 className="text-sm sm:text-xl font-bold font-mono text-slate-800 mt-0.5 truncate">Rs {totalExpense.toLocaleString()}</h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate">Birds + Feed + Ops</p>
            </div>
          </div>

          {/* Net Profit Card */}
          <div className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-xs flex items-center gap-3 sm:gap-4 transition duration-150 animate-in fade-in zoom-in-95 duration-150 ${
            netProfitLoss >= 0 ? 'border-emerald-200 hover:border-emerald-300 hover:shadow-sm' : 'border-rose-200 hover:border-rose-300 hover:shadow-sm'
          }`} id="kpi-net-profit">
            <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${
              netProfitLoss >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {netProfitLoss >= 0 ? <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">Net Profit/Loss</p>
              <h4 className={`text-sm sm:text-xl font-bold font-mono mt-0.5 truncate ${netProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {netProfitLoss >= 0 ? '+' : ''}Rs {netProfitLoss.toLocaleString()}
              </h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate">Ledger Balance</p>
            </div>
          </div>

          {/* ROI Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4 hover:border-slate-300 hover:shadow-sm transition duration-150 animate-in fade-in zoom-in-95 duration-150" id="kpi-roi">
            <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Percent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">ROI %</p>
              <h4 className={`text-sm sm:text-xl font-bold font-mono mt-0.5 truncate ${roiPercent >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {roiPercent.toFixed(1)}%
              </h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate font-medium italic">High Gain Ratio</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Section 2: Flock & Health overview */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
          Flock & Productivity Metrics
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Active Birds */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4 hover:border-slate-300 hover:shadow-sm transition duration-150 animate-in fade-in zoom-in-95 duration-150" id="kpi-active-birds">
            <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">Active Birds</p>
              <h4 className="text-sm sm:text-xl font-bold font-mono text-slate-800 mt-0.5 truncate">
                {activeBirdsCount} <span className="text-[10px] sm:text-xs text-slate-400 font-normal">/{totalBirdsCount}</span>
              </h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate">
                {birds.filter(b => b.status === 'Active' && b.gender === 'Male').length}♂ | {birds.filter(b => b.status === 'Active' && b.gender === 'Female').length}♀
              </p>
            </div>
          </div>

          {/* Mortality Rate */}
          <div className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-xs flex items-center gap-3 sm:gap-4 transition duration-150 animate-in fade-in zoom-in-95 duration-150 ${
            showHighMortality ? 'border-red-200 hover:border-red-300 hover:shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
          }`} id="kpi-mortality-rate">
            <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${
              showHighMortality ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
            }`}>
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">Mortality</p>
              <h4 className={`text-sm sm:text-xl font-bold font-mono mt-0.5 truncate ${showHighMortality ? 'text-red-600' : 'text-slate-800'}`}>
                {mortalityRatePercent.toFixed(1)}%
              </h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate">{deadBirdsCount} deceased birds</p>
            </div>
          </div>

          {/* Average Eggs/Hen/Day */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4 hover:border-slate-300 hover:shadow-sm transition duration-150 animate-in fade-in zoom-in-95 duration-150" id="kpi-egg-efficiency">
            <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Egg className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">Avg Eggs/Hen</p>
              <h4 className="text-sm sm:text-xl font-bold font-mono text-slate-800 mt-0.5 truncate">{avgEggsPerHenPerDay.toFixed(2)}</h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate">{activeFemaleBirdsCount} hens laying</p>
            </div>
          </div>

          {/* Total Eggs Collected */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 sm:gap-4 hover:border-slate-300 hover:shadow-sm transition duration-150 animate-in fade-in zoom-in-95 duration-150" id="kpi-total-eggs">
            <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Egg className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs sm:text-xs text-slate-500 font-bold uppercase tracking-wider truncate">Total Eggs</p>
              <h4 className="text-sm sm:text-xl font-bold font-mono text-slate-800 mt-0.5 truncate">{totalEggsCollected}</h4>
              <p className="text-4xs sm:text-3xs text-slate-400 mt-0.5 truncate">{uniqueDaysCount} logging days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Trigger Panel */}
      <div className="bg-indigo-900 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Activity className="w-72 h-72 text-white" />
        </div>
        <div className="relative z-10 space-y-4">
          <div>
            <h3 className="text-base font-bold font-display text-white">Daily Egg & Feed Pulse</h3>
            <p className="text-xs text-indigo-200 mt-1">Record purchases, update sales, log active flocks and ensure continuous feed stock.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => openQuickAction('bird')} 
              className="flex items-center justify-center gap-2 p-2.5 bg-indigo-800 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs border border-indigo-700 transition duration-150 shadow-xs cursor-pointer"
              id="btn-quick-log-bird"
            >
              <Plus className="w-4 h-4 text-indigo-300" />
              <span>Log Bird</span>
            </button>
            <button 
              onClick={() => openQuickAction('egg')} 
              className="flex items-center justify-center gap-2 p-2.5 bg-indigo-800 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs border border-indigo-700 transition duration-150 shadow-xs cursor-pointer"
              id="btn-quick-log-eggs"
            >
              <Plus className="w-4 h-4 text-indigo-300" />
              <span>Log Daily Eggs</span>
            </button>
            <button 
              onClick={() => openQuickAction('expense')} 
              className="flex items-center justify-center gap-2 p-2.5 bg-indigo-800 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs border border-indigo-700 transition duration-150 shadow-xs cursor-pointer"
              id="btn-quick-log-expense"
            >
              <Plus className="w-4 h-4 text-indigo-300" />
              <span>Log Other Expense</span>
            </button>
            <button 
              onClick={() => openQuickAction('feed')} 
              className="flex items-center justify-center gap-2 p-2.5 bg-indigo-800 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs border border-indigo-700 transition duration-150 shadow-xs cursor-pointer"
              id="btn-quick-log-feed"
            >
              <Plus className="w-4 h-4 text-indigo-300" />
              <span>Log Feed Purchase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Overview Layout: Recent Transactions & Active Dead Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Financial Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-800 font-display">Recent Operations</h4>
            <button 
              onClick={() => onNavigate('ledger')} 
              className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
            >
              View Ledger
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {feedRecords.length === 0 && otherExpenses.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">No transactions recorded yet.</p>
            ) : (
              [
                ...feedRecords.map(f => ({ 
                  type: 'Feed', 
                  title: `${f.feedType} (${f.quantityKg}kg)`, 
                  date: f.date, 
                  amt: f.quantityKg * f.rateRsPerKg, 
                  positive: false 
                })),
                ...otherExpenses.map(o => ({ 
                  type: 'Expense', 
                  title: o.detail, 
                  date: o.date, 
                  amt: o.amount, 
                  positive: false 
                })),
                ...eggProduction.map(e => ({ 
                  type: 'Egg Sale', 
                  title: `Sold ${e.sold} Eggs`, 
                  date: e.date, 
                  amt: e.sold * settings.defaultPricePerEgg, 
                  positive: true 
                }))
              ]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3">
                  <div>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-3xs font-mono font-bold mr-2 ${
                      item.type === 'Feed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      item.type === 'Expense' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {item.type}
                    </span>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${item.positive ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {item.positive ? '+' : '-'}Rs {item.amt.toLocaleString()}
                    </span>
                    <p className="text-3xs text-slate-400 font-mono mt-0.5">{item.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses & Income breakdown charts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-800 font-display">Operational Expense Split</h4>
            <span className="text-2xs font-mono text-slate-400">Detailed Breakdowns</span>
          </div>

          <div className="space-y-4">
            {/* Birds Purchase cost bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-600">Birds Acquisition</span>
                <span className="font-mono text-slate-800 font-bold">Rs {totalBirdPurchaseCost.toLocaleString()} ({totalExpense > 0 ? ((totalBirdPurchaseCost / totalExpense) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-400 h-full rounded-full" 
                  style={{ width: `${totalExpense > 0 ? (totalBirdPurchaseCost / totalExpense) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Feed Records cost bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-600">Feed Purchases</span>
                <span className="font-mono text-slate-800 font-bold">Rs {totalFeedCost.toLocaleString()} ({totalExpense > 0 ? ((totalFeedCost / totalExpense) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full" 
                  style={{ width: `${totalExpense > 0 ? (totalFeedCost / totalExpense) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Other operational expenses bar */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-600">Medicine & Repairs (Other)</span>
                <span className="font-mono text-slate-800 font-bold">Rs {totalOtherExpenses.toLocaleString()} ({totalExpense > 0 ? ((totalOtherExpenses / totalExpense) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full" 
                  style={{ width: `${totalExpense > 0 ? (totalOtherExpenses / totalExpense) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Simple Health Balance Indicator */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Health Performance Metric</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-3xs font-bold">
                  {activeBirdsCount} Active
                </span>
                <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-100 rounded text-3xs font-bold">
                  {deadBirdsCount} Deceased
                </span>
                {soldBirdsCount > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded text-3xs font-bold">
                    {soldBirdsCount} Sold
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
