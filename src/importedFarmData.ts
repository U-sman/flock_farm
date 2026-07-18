import { Bird, OtherExpense, FeedRecord, EggProduction } from './types';

// Real farm records imported from Poultry_English_V10.xlsx
// Generated once during import setup — safe to edit or delete after importing.

export const IMPORTED_BIRDS: Bird[] = [
  {
    "id": 1,
    "name": "Purana kukar",
    "gender": "Male",
    "dateBought": "2026-04-24",
    "price": 225.0,
    "status": "Active",
    "ageBoughtDays": 82
  },
  {
    "id": 2,
    "name": "Purani Chitti",
    "gender": "Female",
    "dateBought": "2026-04-24",
    "price": 225.0,
    "status": "Active",
    "ageBoughtDays": 82
  },
  {
    "id": 3,
    "name": "Kamzor ki behn",
    "gender": "Female",
    "dateBought": "2026-05-16",
    "price": 250.0,
    "status": "Sold",
    "ageBoughtDays": 60
  },
  {
    "id": 4,
    "name": "Choti",
    "gender": "Female",
    "dateBought": "2026-05-16",
    "price": 250.0,
    "status": "Sold",
    "ageBoughtDays": 60
  },
  {
    "id": 5,
    "name": "Kala kukar",
    "gender": "Male",
    "dateBought": "2026-05-16",
    "price": 250.0,
    "status": "Active",
    "ageBoughtDays": 60
  },
  {
    "id": 6,
    "name": "Nava Chitta",
    "gender": "Male",
    "dateBought": "2026-05-16",
    "price": 250.0,
    "status": "Active",
    "ageBoughtDays": 60
  },
  {
    "id": 7,
    "name": "Peeli Bari wali",
    "gender": "Female",
    "dateBought": "2026-05-16",
    "price": 250.0,
    "status": "Dead",
    "ageBoughtDays": 60,
    "deathReason": "Injury",
    "deathDetail": "aty wqt rasty ma mar gya "
  },
  {
    "id": 8,
    "name": "Choti peli",
    "gender": "Female",
    "dateBought": "2026-05-16",
    "price": 250.0,
    "status": "Dead",
    "ageBoughtDays": 60,
    "deathReason": "Disease",
    "deathDetail": "Dawai no di thi us wqt pata ni tha "
  },
  {
    "id": 9,
    "name": "Kamzor",
    "gender": "Female",
    "dateBought": "2026-05-16",
    "price": 250.0,
    "status": "Dead",
    "ageBoughtDays": 60,
    "deathReason": "Other",
    "deathDetail": "kamzori ki waja sy"
  },
  {
    "id": 10,
    "name": "Laqway wali",
    "gender": "Female",
    "dateBought": "2026-05-16",
    "price": 500.0,
    "status": "Dead",
    "ageBoughtDays": 60,
    "deathReason": "Disease",
    "deathDetail": "Rani khet sy mar gya "
  },
  {
    "id": 11,
    "name": "hen2",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 12,
    "name": "hen 2",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 13,
    "name": "Kabotri",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 14,
    "name": "Moti",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 15,
    "name": "Peli",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 16,
    "name": "Sony wali",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 17,
    "name": "Kali (Salman mi favourite)",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Dead",
    "ageBoughtDays": 27,
    "dateDied": "2026-07-02",
    "deathReason": "Disease",
    "deathDetail": "Bht din tak beemar thi or is waja sy"
  },
  {
    "id": 18,
    "name": "Kabotri Jaise hi",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 19,
    "name": "Nava kukar",
    "gender": "Male",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 20,
    "name": "Kabotri jaise",
    "gender": "Female",
    "dateBought": "2026-06-05",
    "price": 500.0,
    "status": "Active",
    "ageBoughtDays": 40
  },
  {
    "id": 21,
    "name": "Asseel",
    "gender": "Male",
    "dateBought": "2026-07-07",
    "price": 1500.0,
    "status": "Active",
    "ageBoughtDays": 8
  }
];

export const IMPORTED_EXPENSES: OtherExpense[] = [
  {
    "id": 1,
    "date": "2026-05-30",
    "detail": "ors And GLucose",
    "category": "Medicine",
    "amount": 400.0
  },
  {
    "id": 2,
    "date": "2026-06-02",
    "detail": "Lakri Khudy Ka liya",
    "category": "Repair",
    "amount": 500.0
  },
  {
    "id": 3,
    "date": "2026-06-06",
    "detail": "Jali Darwazy ka liya",
    "category": "Repair",
    "amount": 400.0
  },
  {
    "id": 4,
    "date": "2026-06-11",
    "detail": "Medicine & Multivitamins",
    "category": "Medicine",
    "amount": 500.0
  },
  {
    "id": 5,
    "date": "2026-06-20",
    "detail": "Medicine & Multivitamins",
    "category": "Medicine",
    "amount": 500.0
  },
  {
    "id": 6,
    "date": "2026-07-08",
    "detail": "Beemari ki dawa (Enrosym)",
    "category": "Medicine",
    "amount": 300.0
  }
];

export const IMPORTED_FEED_RECORDS: FeedRecord[] = [
  {
    "id": 1,
    "date": "2026-05-16",
    "feedType": "Eggs",
    "quantityKg": 1.0,
    "rateRsPerKg": 250.0,
    "notes": "Eggs for eating"
  },
  {
    "id": 2,
    "date": "2026-05-31",
    "feedType": "Other",
    "quantityKg": 1.0,
    "rateRsPerKg": 300.0,
    "notes": "Khal & Choker Keery"
  },
  {
    "id": 3,
    "date": "2026-07-08",
    "feedType": "Other",
    "quantityKg": 1.0,
    "rateRsPerKg": 150.0,
    "notes": "Feed no 14"
  },
  {
    "id": 4,
    "date": "2026-07-10",
    "feedType": "Eggs",
    "quantityKg": 1.0,
    "rateRsPerKg": 40.0,
    "notes": "2 egg's Aseel eating ka liga"
  },
  {
    "id": 5,
    "date": "2026-07-15",
    "feedType": "Other",
    "quantityKg": 1.0,
    "rateRsPerKg": 140.0,
    "notes": "Feed 14 no"
  }
];

export const IMPORTED_EGG_PRODUCTION: EggProduction[] = [];
