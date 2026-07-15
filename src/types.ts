export type Gender = 'Male' | 'Female';
export type BirdStatus = 'Active' | 'Sold' | 'Dead';
export type DeathReason = 'Disease' | 'Injury' | 'Predator' | 'Other' | 'Unknown';

export interface Bird {
  id: number;
  name: string;
  gender: Gender;
  dateBought: string; // YYYY-MM-DD
  price: number; // Rs
  status: BirdStatus;
  ageBoughtDays: number; // Age in days at the time of purchase
  dateOfBirth?: string; // YYYY-MM-DD
  dateDied?: string; // YYYY-MM-DD
  deathReason?: DeathReason;
  deathDetail?: string;
  lastVaccinationDate?: string; // YYYY-MM-DD
}

export type ExpenseCategory = 'Medicine' | 'Repair' | 'Utility' | 'Other';

export interface OtherExpense {
  id: number;
  date: string; // YYYY-MM-DD
  detail: string;
  category: ExpenseCategory;
  amount: number; // Rs
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
  date: string; // YYYY-MM-DD
  feedType: FeedType;
  quantityKg: number;
  rateRsPerKg: number;
  // Total cost is calculated: quantity * rate
  notes?: string;
}

export interface EggProduction {
  date: string; // YYYY-MM-DD (Primary Key)
  totalEggsCollected: number;
  sold: number;
  homeUse: number;
  brokenWasted: number;
  // remaining: totalCollected - sold - homeUse - brokenWasted
  // saleIncome: sold * defaultPricePerEgg
}

export interface GlobalSettings {
  defaultPricePerEgg: number; // Default: Rs 25
  vaccinationIntervalDays: number; // Default: 30
}

export interface MonthlySummaryItem {
  month: string; // YYYY-MM
  totalExpense: number;
  eggIncome: number;
  netBalance: number;
  eggsCollected: number;
  feedCost: number;
}
