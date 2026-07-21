import React, { useMemo } from 'react';
import { 
  CalendarRange, 
  Egg, 
  ShoppingBag,
} from 'lucide-react';
import { Bird, OtherExpense, FeedRecord, EggProduction, GlobalSettings, MonthlySummaryItem, DateRange, Lang } from '../types';

interface MonthlySummaryProps {
  birds: Bird[];
  otherExpenses: OtherExpense[];
  feedRecords: FeedRecord[];
  eggProduction: EggProduction[];
  settings: GlobalSettings;
  lang?: Lang;
  dateRange?: DateRange | null;
  rangeFrom?: string;
  rangeTo?: string;
  onDateRangeChange?: (from: string, to: string) => void;
  onDatePreset?: (preset: 'all' | 'month' | '30d') => void;
}

export default function MonthlySummary({
  birds,
  otherExpenses,
  feedRecords,
  eggProduction,
  settings,
  lang = 'en',
  rangeFrom = '',
  rangeTo = '',
  onDateRangeChange,
  onDatePreset
}: MonthlySummaryProps) {
  
  // Calculate aggregated monthly data dynamically
  const monthlyDataList = useMemo(() => {
    const monthsSet = new Set<string>();

    // Extract all unique months from all datasets (YYYY-MM)
    birds.forEach(b => {
      if (b.dateBought) monthsSet.add(b.dateBought.substring(0, 7));
    });
    otherExpenses.forEach(o => {
      if (o.date) monthsSet.add(o.date.substring(0, 7));
    });
    feedRecords.forEach(f => {
      if (f.date) monthsSet.add(f.date.substring(0, 7));
    });
    eggProduction.forEach(e => {
      if (e.date) monthsSet.add(e.date.substring(0, 7));
    });

    const monthsArray = Array.from(monthsSet).sort((a, b) => b.localeCompare(a)); // Sort newest first

    const summaries: MonthlySummaryItem[] = monthsArray.map(month => {
      // 1. Bird Expenses in this month
      const birdExpense = birds
        .filter(b => b.dateBought && b.dateBought.startsWith(month))
        .reduce((sum, b) => sum + (b.price || 0), 0);

      // 2. Feed Cost & kg in this month
      const monthFeedRecords = feedRecords.filter(f => f.date && f.date.startsWith(month));
      const feedCost = monthFeedRecords.reduce((sum, f) => sum + (f.quantityKg * f.rateRsPerKg), 0);
      const feedKg = monthFeedRecords.reduce((sum, f) => sum + f.quantityKg, 0);

      // 3. Other Expenses in this month
      const otherExpCost = otherExpenses
        .filter(o => o.date && o.date.startsWith(month))
        .reduce((sum, o) => sum + (o.amount || 0), 0);

      const totalExpense = birdExpense + feedCost + otherExpCost;

      // 4. Egg Income in this month (Sold * setting defaultPricePerEgg)
      const eggIncome = eggProduction
        .filter(e => e.date && e.date.startsWith(month))
        .reduce((sum, e) => sum + (e.sold * settings.defaultPricePerEgg), 0);

      const netBalance = eggIncome - totalExpense;

      // 5. Total Eggs Collected
      const eggsCollected = eggProduction
        .filter(e => e.date && e.date.startsWith(month))
        .reduce((sum, e) => sum + e.totalEggsCollected, 0);

      return {
        month,
        totalExpense,
        eggIncome,
        netBalance,
        eggsCollected,
        birdPurchase: birdExpense,
        feedCost,
        feedKg,
        otherExpenses: otherExpCost,
      };
    });

    return summaries;
  }, [birds, otherExpenses, feedRecords, eggProduction, settings]);

  // Helper to get printable month names (e.g., "July 2026")
  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6" id="monthly-summary-tab">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800">Monthly Performance Summaries</h2>
        <p className="text-xs text-slate-500">Analyze monthly consolidated farm indices, comparing feed investments, egg production yields, and gross balance sheets.</p>
      </div>

      {/* Grid of monthly aggregated data cards */}
      {monthlyDataList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <CalendarRange className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No monthly records found yet.</p>
          <p className="text-xs text-slate-400 mt-1">Add bird acquisitions, egg logs, or feed receipts to generate logs here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="monthly-summary-grid">
            {monthlyDataList.map((summary) => {
              const profitState = summary.netBalance >= 0;
              return (
                <div 
                  key={summary.month} 
                  className={`p-6 rounded-2xl border transition hover:shadow-xs flex flex-col justify-between space-y-4 ${
                    profitState ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-300' : 'bg-rose-50/20 border-rose-100 hover:border-rose-300'
                  }`}
                  id={`monthly-card-${summary.month}`}
                >
                  {/* Top: Month Header & Net Status */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-3xs font-bold text-slate-400 font-mono uppercase tracking-wider">Statement Period</span>
                      <h3 className="font-bold text-base text-slate-800 mt-0.5">{formatMonthName(summary.month)}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1 border ${
                      profitState ? 'bg-emerald-100/60 text-emerald-800 border-emerald-200' : 'bg-rose-100/60 text-rose-800 border-rose-200'
                    }`}>
                      {profitState ? '+' : ''}Rs {summary.netBalance.toLocaleString()}
                    </span>
                  </div>

                  {/* Body: Key Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-2xs py-1.5 font-semibold">
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Total Eggs</span>
                      <span className="text-slate-900 font-mono font-bold flex items-center gap-1 text-xs">
                        <Egg className="w-3.5 h-3.5 text-amber-500" /> {summary.eggsCollected}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Egg Revenue</span>
                      <span className="text-emerald-700 font-mono text-xs font-bold">Rs {summary.eggIncome.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Bird Purchase</span>
                      <span className="text-slate-800 font-mono text-xs flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" /> Rs {summary.birdPurchase.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Feed Cost</span>
                      <span className="text-slate-800 font-mono text-xs">Rs {summary.feedCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Other Expenses</span>
                      <span className="text-slate-800 font-mono text-xs">Rs {summary.otherExpenses.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-mono tracking-wider text-3xs mb-0.5">Total Expense</span>
                      <span className="text-rose-700 font-mono text-xs font-bold">Rs {summary.totalExpense.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Footer status quote */}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-3xs text-slate-400 font-mono">
                    <span>Month code: {summary.month}</span>
                    <span className={profitState ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                      {profitState ? '✓ Profitable performance' : '⚠ Capital deficit registered'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consolidated Grid Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Tabular Historical Comparison</h4>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-mono uppercase text-3xs tracking-wider">
                      <th className="p-3">Statement Month</th>
                      <th className="p-3 text-center">Eggs Collected</th>
                      <th className="p-3 text-right">Bird Purchase (Rs)</th>
                      <th className="p-3 text-right">Feed Used (kg)</th>
                      <th className="p-3 text-right">Feed Cost (Rs)</th>
                      <th className="p-3 text-right">Other Expenses (Rs)</th>
                      <th className="p-3 text-right">Total Expenses (Rs)</th>
                      <th className="p-3 text-right">Egg Commercial Income (Rs)</th>
                      <th className="p-3 text-right">Net Balance Sheet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {monthlyDataList.map((item) => (
                      <tr key={item.month} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800 font-display">{formatMonthName(item.month)}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900">{item.eggsCollected}</td>
                        <td className="p-3 text-right font-mono text-indigo-800">Rs {item.birdPurchase.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-lime-800">{item.feedKg.toLocaleString()} kg</td>
                        <td className="p-3 text-right font-mono text-amber-800">Rs {item.feedCost.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-slate-700">Rs {item.otherExpenses.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-rose-800">Rs {item.totalExpense.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-emerald-800">Rs {item.eggIncome.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={item.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {item.netBalance >= 0 ? '+' : ''}Rs {item.netBalance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
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
