export interface Bean {
  id: string;
  country: string;
  region: string;
  farm: string;
  variety: string;
  process: string;
  altitude: string;
  roaster: string;
  weight: number;
  price: number;
  purchaseDate: string;
  status: 'Active' | 'Finished';
  flavorNotes: string[];
}

export interface PourStep {
  time: string; // e.g. "0:45"
  amount: number; // e.g. 50
}

export interface Brew {
  id: string;
  date: string;
  beanId: string;
  recipeName: string;
  grinder: string;
  clicks: number;
  dripper: string;
  filterType: string;
  waterTemp: number;
  pourSteps: string; // JSON string of PourStep[]
  totalTime: string;
  tasteReview: string;
  calculatedCost: number;
}

export interface Preset {
  id: string;
  recipeName: string;
  grinder: string;
  clicks: number;
  dripper: string;
  temp: number;
  pourSteps: string; // JSON string of PourStep[]
}

export interface CafeLog {
  id: string;
  date: string;
  cafeName: string;
  beanName: string;
  price: number;
  review: string;
  flavorNotes: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ADD_BEAN = 'ADD_BEAN',
  LOG_BREW = 'LOG_BREW',
  CAFE_LOG = 'CAFE_LOG',
  BEAN_ARCHIVE = 'BEAN_ARCHIVE',
  BREW_HISTORY = 'BREW_HISTORY',
  PRESET_MANAGER = 'PRESET_MANAGER',
  BREW_DETAIL = 'BREW_DETAIL'
}
