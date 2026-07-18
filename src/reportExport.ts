import { Bird, OtherExpense, FeedRecord, EggProduction, GlobalSettings } from './types';

const todayStr = () => new Date().toISOString().slice(0, 10);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Opens a print-ready page; user saves as PDF via the browser print dialog. */
function printReport(title: string, headers: string[], rows: (string | number)[][]): void {
  const tableHead = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #0d9488; color: #fff; }
    tr:nth-child(even) td { background: #f8fafc; }
    @media print {
      body { padding: 0; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">Generated: ${todayStr()}</div>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups to print this report.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- PDF EXPORTS (browser print → Save as PDF) ----------

export function exportEggPDF(eggProduction: EggProduction[], settings: GlobalSettings) {
  const rows = [...eggProduction]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const remaining = e.totalEggsCollected - e.sold - e.homeUse - e.brokenWasted;
      const saleIncome = e.sold * settings.defaultPricePerEgg;
      return [
        e.date,
        e.totalEggsCollected,
        e.sold,
        e.homeUse,
        e.brokenWasted,
        remaining,
        `Rs ${saleIncome.toLocaleString()}`,
      ];
    });

  printReport('Flock Farm — Egg Production Report', [
    'Date',
    'Total Eggs',
    'Sold',
    'Home Use',
    'Broken',
    'Remaining',
    'Sale Income',
  ], rows);
}

export function exportExpensePDF(otherExpenses: OtherExpense[], feedRecords: FeedRecord[]) {
  const rows = [
    ...otherExpenses.map((o) => [
      'Other',
      o.date,
      o.detail,
      o.category,
      `Rs ${o.amount.toLocaleString()}`,
      o.notes || '',
    ]),
    ...feedRecords.map((f) => [
      'Feed',
      f.date,
      `${f.feedType} (${f.quantityKg}kg)`,
      'Feed',
      `Rs ${(f.quantityKg * f.rateRsPerKg).toLocaleString()}`,
      f.notes || '',
    ]),
  ].sort((a, b) => String(a[1]).localeCompare(String(b[1])));

  printReport('Flock Farm — Expense Report', [
    'Type',
    'Date',
    'Detail',
    'Category',
    'Amount',
    'Notes',
  ], rows);
}

export function exportMonthlySummaryPDF(
  birds: Bird[],
  otherExpenses: OtherExpense[],
  feedRecords: FeedRecord[],
  eggProduction: EggProduction[],
  settings: GlobalSettings
) {
  const monthsSet = new Set<string>();
  birds.forEach((b) => b.dateBought && monthsSet.add(b.dateBought.substring(0, 7)));
  otherExpenses.forEach((o) => o.date && monthsSet.add(o.date.substring(0, 7)));
  feedRecords.forEach((f) => f.date && monthsSet.add(f.date.substring(0, 7)));
  eggProduction.forEach((e) => e.date && monthsSet.add(e.date.substring(0, 7)));

  const months = Array.from(monthsSet).sort((a, b) => a.localeCompare(b));

  const rows = months.map((month) => {
    const birdCost = birds
      .filter((b) => b.dateBought?.startsWith(month))
      .reduce((s, b) => s + (b.price || 0), 0);
    const feedCost = feedRecords
      .filter((f) => f.date?.startsWith(month))
      .reduce((s, f) => s + f.quantityKg * f.rateRsPerKg, 0);
    const otherCost = otherExpenses
      .filter((o) => o.date?.startsWith(month))
      .reduce((s, o) => s + (o.amount || 0), 0);
    const totalExpense = birdCost + feedCost + otherCost;
    const eggIncome = eggProduction
      .filter((e) => e.date?.startsWith(month))
      .reduce((s, e) => s + e.sold * settings.defaultPricePerEgg, 0);
    const eggsCollected = eggProduction
      .filter((e) => e.date?.startsWith(month))
      .reduce((s, e) => s + e.totalEggsCollected, 0);
    const netBalance = eggIncome - totalExpense;
    return [
      month,
      eggsCollected,
      `Rs ${eggIncome.toLocaleString()}`,
      `Rs ${feedCost.toLocaleString()}`,
      `Rs ${totalExpense.toLocaleString()}`,
      `Rs ${netBalance.toLocaleString()}`,
    ];
  });

  printReport('Flock Farm — Monthly Summary Report', [
    'Month',
    'Eggs Collected',
    'Egg Income',
    'Feed Cost',
    'Total Expense',
    'Net Balance',
  ], rows);
}

// ---------- CSV EXPORTS (opens in Excel / Google Sheets) ----------

export function exportEggExcel(eggProduction: EggProduction[], settings: GlobalSettings) {
  const rows = [...eggProduction]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [
      e.date,
      e.totalEggsCollected,
      e.sold,
      e.homeUse,
      e.brokenWasted,
      e.totalEggsCollected - e.sold - e.homeUse - e.brokenWasted,
      e.sold * settings.defaultPricePerEgg,
    ]);

  downloadCsv(`flock-farm-egg-report-${todayStr()}.csv`, [
    'Date',
    'Total Eggs',
    'Sold',
    'Home Use',
    'Broken/Wasted',
    'Remaining',
    'Sale Income (Rs)',
  ], rows);
}

export function exportExpenseExcel(otherExpenses: OtherExpense[], feedRecords: FeedRecord[]) {
  const rows = [
    ...otherExpenses.map((o) => [
      'Other',
      o.date,
      o.detail,
      o.category,
      o.amount,
      o.notes || '',
    ]),
    ...feedRecords.map((f) => [
      'Feed',
      f.date,
      `${f.feedType} (${f.quantityKg}kg)`,
      'Feed',
      f.quantityKg * f.rateRsPerKg,
      f.notes || '',
    ]),
  ].sort((a, b) => String(a[1]).localeCompare(String(b[1])));

  downloadCsv(`flock-farm-expense-report-${todayStr()}.csv`, [
    'Type',
    'Date',
    'Detail',
    'Category',
    'Amount (Rs)',
    'Notes',
  ], rows);
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
