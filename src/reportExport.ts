import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Bird, OtherExpense, FeedRecord, EggProduction, GlobalSettings } from './types';

const todayStr = () => new Date().toISOString().slice(0, 10);

// ---------- PDF EXPORTS ----------

export function exportEggPDF(eggProduction: EggProduction[], settings: GlobalSettings) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Flock Farm — Egg Production Report', 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated: ${todayStr()}`, 14, 22);

  const rows = [...eggProduction]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => {
      const remaining = e.totalEggsCollected - e.sold - e.homeUse - e.brokenWasted;
      const saleIncome = e.sold * settings.defaultPricePerEgg;
      return [e.date, e.totalEggsCollected, e.sold, e.homeUse, e.brokenWasted, remaining, `Rs ${saleIncome.toLocaleString()}`];
    });

  autoTable(doc, {
    startY: 28,
    head: [['Date', 'Total Eggs', 'Sold', 'Home Use', 'Broken', 'Remaining', 'Sale Income']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 148, 136] }, // teal
  });

  doc.save(`flock-farm-egg-report-${todayStr()}.pdf`);
}

export function exportExpensePDF(otherExpenses: OtherExpense[], feedRecords: FeedRecord[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Flock Farm — Expense Report', 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated: ${todayStr()}`, 14, 22);

  const rows = [
    ...otherExpenses.map(o => ['Other', o.date, o.detail, o.category, `Rs ${o.amount.toLocaleString()}`, o.notes || '']),
    ...feedRecords.map(f => ['Feed', f.date, `${f.feedType} (${f.quantityKg}kg)`, 'Feed', `Rs ${(f.quantityKg * f.rateRsPerKg).toLocaleString()}`, f.notes || '']),
  ].sort((a, b) => String(a[1]).localeCompare(String(b[1])));

  autoTable(doc, {
    startY: 28,
    head: [['Type', 'Date', 'Detail', 'Category', 'Amount', 'Notes']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 148, 136] },
  });

  doc.save(`flock-farm-expense-report-${todayStr()}.pdf`);
}

export function exportMonthlySummaryPDF(
  birds: Bird[],
  otherExpenses: OtherExpense[],
  feedRecords: FeedRecord[],
  eggProduction: EggProduction[],
  settings: GlobalSettings
) {
  const monthsSet = new Set<string>();
  birds.forEach(b => b.dateBought && monthsSet.add(b.dateBought.substring(0, 7)));
  otherExpenses.forEach(o => o.date && monthsSet.add(o.date.substring(0, 7)));
  feedRecords.forEach(f => f.date && monthsSet.add(f.date.substring(0, 7)));
  eggProduction.forEach(e => e.date && monthsSet.add(e.date.substring(0, 7)));

  const months = Array.from(monthsSet).sort((a, b) => a.localeCompare(b));

  const rows = months.map(month => {
    const birdCost = birds.filter(b => b.dateBought?.startsWith(month)).reduce((s, b) => s + (b.price || 0), 0);
    const feedCost = feedRecords.filter(f => f.date?.startsWith(month)).reduce((s, f) => s + f.quantityKg * f.rateRsPerKg, 0);
    const otherCost = otherExpenses.filter(o => o.date?.startsWith(month)).reduce((s, o) => s + (o.amount || 0), 0);
    const totalExpense = birdCost + feedCost + otherCost;
    const eggIncome = eggProduction.filter(e => e.date?.startsWith(month)).reduce((s, e) => s + e.sold * settings.defaultPricePerEgg, 0);
    const eggsCollected = eggProduction.filter(e => e.date?.startsWith(month)).reduce((s, e) => s + e.totalEggsCollected, 0);
    const netBalance = eggIncome - totalExpense;
    return [month, eggsCollected, `Rs ${eggIncome.toLocaleString()}`, `Rs ${feedCost.toLocaleString()}`, `Rs ${totalExpense.toLocaleString()}`, `Rs ${netBalance.toLocaleString()}`];
  });

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Flock Farm — Monthly Summary Report', 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated: ${todayStr()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Month', 'Eggs Collected', 'Egg Income', 'Feed Cost', 'Total Expense', 'Net Balance']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 148, 136] },
  });

  doc.save(`flock-farm-monthly-summary-${todayStr()}.pdf`);
}

// ---------- EXCEL EXPORTS ----------

export function exportEggExcel(eggProduction: EggProduction[], settings: GlobalSettings) {
  const rows = [...eggProduction]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({
      Date: e.date,
      'Total Eggs': e.totalEggsCollected,
      Sold: e.sold,
      'Home Use': e.homeUse,
      'Broken/Wasted': e.brokenWasted,
      Remaining: e.totalEggsCollected - e.sold - e.homeUse - e.brokenWasted,
      'Sale Income (Rs)': e.sold * settings.defaultPricePerEgg,
    }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Egg Production');
  XLSX.writeFile(wb, `flock-farm-egg-report-${todayStr()}.xlsx`);
}

export function exportExpenseExcel(otherExpenses: OtherExpense[], feedRecords: FeedRecord[]) {
  const rows = [
    ...otherExpenses.map(o => ({
      Type: 'Other',
      Date: o.date,
      Detail: o.detail,
      Category: o.category,
      'Amount (Rs)': o.amount,
      Notes: o.notes || '',
    })),
    ...feedRecords.map(f => ({
      Type: 'Feed',
      Date: f.date,
      Detail: `${f.feedType} (${f.quantityKg}kg)`,
      Category: 'Feed',
      'Amount (Rs)': f.quantityKg * f.rateRsPerKg,
      Notes: f.notes || '',
    })),
  ].sort((a, b) => a.Date.localeCompare(b.Date));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  XLSX.writeFile(wb, `flock-farm-expense-report-${todayStr()}.xlsx`);
}

// ---------- BACKUP & RESTORE (full data JSON) ----------

export interface FlockFarmBackup {
  exportedAt: string;
  birds: Bird[];
  otherExpenses: OtherExpense[];
  feedRecords: FeedRecord[];
  eggProduction: EggProduction[];
  settings: GlobalSettings;
}

export function downloadBackup(
  birds: Bird[],
  otherExpenses: OtherExpense[],
  feedRecords: FeedRecord[],
  eggProduction: EggProduction[],
  settings: GlobalSettings
) {
  const backup: FlockFarmBackup = {
    exportedAt: new Date().toISOString(),
    birds,
    otherExpenses,
    feedRecords,
    eggProduction,
    settings,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flock-farm-backup-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(file: File): Promise<FlockFarmBackup> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        // Basic shape validation so we don't load garbage into the app
        if (!Array.isArray(parsed.birds) || !parsed.settings) {
          throw new Error('This file does not look like a valid Flock Farm backup.');
        }
        resolve(parsed as FlockFarmBackup);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsText(file);
  });
}
