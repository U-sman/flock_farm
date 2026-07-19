export type Gender = 'Male' | 'Female';
export type BirdStatus = 'Active' | 'Sold' | 'Dead';
export type DeathReason = 'Disease' | 'Injury' | 'Predator' | 'Other' | 'Unknown';
export type BirdBreed = 'Desi' | 'Rhode Island' | 'Broiler' | 'Layer' | 'Fayoumi' | 'Other';
export type UserRole = 'admin' | 'worker';
export type Lang = 'en' | 'ur';
export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface BirdBatch {
  id: number;
  name: string;
  description?: string;
  startDate: string;
}

export interface VaccinationRecord {
  id: number;
  birdId: number;
  date: string;
  vaccineName: string;
  dose?: string;
  cost?: number;
  notes?: string;
}

export interface Bird {
  id: number;
  name: string;
  gender: Gender;
  dateBought: string;
  price: number;
  status: BirdStatus;
  ageBoughtDays: number;
  breed?: BirdBreed;
  batchId?: number;
  dateOfBirth?: string;
  dateDied?: string;
  deathReason?: DeathReason;
  deathDetail?: string;
  lastVaccinationDate?: string;
  salePrice?: number;
  saleDate?: string;
}

export type ExpenseCategory = 'Medicine' | 'Repair' | 'Utility' | 'Other';

export interface OtherExpense {
  id: number;
  date: string;
  detail: string;
  category: ExpenseCategory;
  amount: number;
  notes?: string;
}

export type FeedType =
  | 'Khal & Choker'
  | 'Corn'
  | 'Wheat'
  | 'Grains'
  | 'Supplements'
  | 'Medicine'
  | 'Other'
  | 'Eggs';

export interface FeedRecord {
  id: number;
  date: string;
  feedType: FeedType;
  quantityKg: number;
  rateRsPerKg: number;
  notes?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface CustomerSale {
  id: number;
  customerId: number;
  date: string;
  eggsQty: number;
  pricePerEgg: number;
  amountPaid: number;
  notes?: string;
}

export interface EggProduction {
  date: string;
  totalEggsCollected: number;
  sold: number;
  homeUse: number;
  brokenWasted: number;
  pricePerEgg?: number;
  customerId?: number;
}

export interface IncubationRecord {
  id: number;
  startDate: string;
  eggsSet: number;
  hatchDate?: string;
  hatched: number;
  notes?: string;
  batchId?: number;
}

export interface DailyChecklistEntry {
  date: string;
  completed: string[];
}

export interface DiaryEntry {
  date: string;
  note: string;
}

export interface GlobalSettings {
  defaultPricePerEgg: number;
  vaccinationIntervalDays: number;
  feedLowStockDays?: number;
  feedConsumptionKgPerDay?: number;
  adminPin?: string;
}

export interface MonthlySummaryItem {
  month: string;
  totalExpense: number;
  eggIncome: number;
  birdSaleIncome: number;
  netBalance: number;
  eggsCollected: number;
  birdPurchase: number;
  feedCost: number;
  otherExpenses: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export const CHECKLIST_TASKS = [
  { id: 'collect_eggs', labelEn: 'Collect eggs', labelUr: 'انڈے جمع کریں' },
  { id: 'feed_birds', labelEn: 'Feed birds', labelUr: 'پرندوں کو دانہ دیں' },
  { id: 'check_water', labelEn: 'Check water', labelUr: 'پani چیک کریں' },
  { id: 'clean_coop', labelEn: 'Clean coop', labelUr: 'باڑہ صاف کریں' },
  { id: 'health_check', labelEn: 'Health check', labelUr: 'صحت چیک کریں' },
  { id: 'lock_coop', labelEn: 'Lock coop at night', labelUr: 'رات کو باڑہ بند کریں' },
] as const;
