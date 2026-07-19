import {
  Bird,
  OtherExpense,
  FeedRecord,
  EggProduction,
  GlobalSettings,
  CustomerSale,
  DateRange,
} from '../types';

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function inDateRange(date: string, range: DateRange | null): boolean {
  if (!range) return true;
  return date >= range.from && date <= range.to;
}

export function eggSaleIncome(record: EggProduction, settings: GlobalSettings): number {
  const price = record.pricePerEgg ?? settings.defaultPricePerEgg;
  return record.sold * price;
}

export function totalEggIncome(eggProduction: EggProduction[], settings: GlobalSettings, range?: DateRange | null): number {
  return eggProduction
    .filter((e) => inDateRange(e.date, range ?? null))
    .reduce((sum, e) => sum + eggSaleIncome(e, settings), 0);
}

export function birdSaleIncome(birds: Bird[], range?: DateRange | null): number {
  return birds
    .filter((b) => b.status === 'Sold' && b.salePrice && b.saleDate && inDateRange(b.saleDate, range ?? null))
    .reduce((sum, b) => sum + (b.salePrice || 0), 0);
}

export function totalFeedCost(feedRecords: FeedRecord[], range?: DateRange | null): number {
  return feedRecords
    .filter((f) => inDateRange(f.date, range ?? null))
    .reduce((sum, f) => sum + f.quantityKg * f.rateRsPerKg, 0);
}

export function totalOtherExpenses(otherExpenses: OtherExpense[], range?: DateRange | null): number {
  return otherExpenses
    .filter((o) => inDateRange(o.date, range ?? null))
    .reduce((sum, o) => sum + o.amount, 0);
}

export function totalBirdPurchaseCost(birds: Bird[], range?: DateRange | null): number {
  return birds
    .filter((b) => inDateRange(b.dateBought, range ?? null))
    .reduce((sum, b) => sum + (b.price || 0), 0);
}

export function totalExpense(
  birds: Bird[],
  feedRecords: FeedRecord[],
  otherExpenses: OtherExpense[],
  range?: DateRange | null
): number {
  return (
    totalBirdPurchaseCost(birds, range) +
    totalFeedCost(feedRecords, range) +
    totalOtherExpenses(otherExpenses, range)
  );
}

export function totalIncome(
  birds: Bird[],
  eggProduction: EggProduction[],
  settings: GlobalSettings,
  range?: DateRange | null
): number {
  return totalEggIncome(eggProduction, settings, range) + birdSaleIncome(birds, range);
}

export function costPerEgg(
  birds: Bird[],
  feedRecords: FeedRecord[],
  otherExpenses: OtherExpense[],
  eggProduction: EggProduction[],
  range?: DateRange | null
): number {
  const eggs = eggProduction
    .filter((e) => inDateRange(e.date, range ?? null))
    .reduce((sum, e) => sum + e.totalEggsCollected, 0);
  if (eggs === 0) return 0;
  return totalExpense(birds, feedRecords, otherExpenses, range) / eggs;
}

export function costPerBird(
  birds: Bird[],
  feedRecords: FeedRecord[],
  otherExpenses: OtherExpense[],
  range?: DateRange | null
): number {
  const active = birds.filter((b) => b.status === 'Active').length;
  if (active === 0) return 0;
  return totalExpense(birds, feedRecords, otherExpenses, range) / active;
}

export function productionRate(
  birds: Bird[],
  eggProduction: EggProduction[],
  range?: DateRange | null
): number {
  const activeFemales = birds.filter((b) => b.status === 'Active' && b.gender === 'Female').length;
  const filtered = eggProduction.filter((e) => inDateRange(e.date, range ?? null));
  const days = filtered.length;
  const eggs = filtered.reduce((sum, e) => sum + e.totalEggsCollected, 0);
  if (activeFemales === 0 || days === 0) return 0;
  return eggs / (activeFemales * days);
}

export function feedStockKg(feedRecords: FeedRecord[], consumptionKgPerDay: number, rangeEnd?: string): number {
  const purchased = feedRecords.reduce((sum, f) => sum + f.quantityKg, 0);
  if (feedRecords.length === 0) return 0;
  const end = rangeEnd ? new Date(rangeEnd) : new Date();
  const firstDate = feedRecords.reduce((min, f) => (f.date < min ? f.date : min), feedRecords[0].date);
  const days = Math.max(1, Math.ceil((end.getTime() - new Date(firstDate).getTime()) / 86400000));
  return Math.max(0, purchased - consumptionKgPerDay * days);
}

export function customerBalance(sales: CustomerSale[]): number {
  return sales.reduce((sum, s) => sum + s.eggsQty * s.pricePerEgg - s.amountPaid, 0);
}

export function buildDailySummaryText(params: {
  date: string;
  eggRecord?: EggProduction;
  settings: GlobalSettings;
  activeBirds: number;
  alerts: string[];
}): string {
  const { date, eggRecord, settings, activeBirds, alerts } = params;
  const lines = [
    `🐔 Flock Farm — Daily Summary (${date})`,
    `Active birds: ${activeBirds}`,
  ];
  if (eggRecord) {
    const income = eggSaleIncome(eggRecord, settings);
    lines.push(
      `Eggs collected: ${eggRecord.totalEggsCollected}`,
      `Sold: ${eggRecord.sold} | Home: ${eggRecord.homeUse} | Broken: ${eggRecord.brokenWasted}`,
      `Income: Rs ${income.toLocaleString()}`
    );
  } else {
    lines.push('Eggs: not logged today');
  }
  if (alerts.length) {
    lines.push('Alerts:', ...alerts.map((a) => `• ${a}`));
  }
  return lines.join('\n');
}
