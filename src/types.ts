export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'promptpay';

export interface AppUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isLocalProfile?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface MonthSummary {
  year: number;
  month: number; // 1-12
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  avgDailyExpense: number;
  transactionCount: number;
}

export interface CategoryExpense {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface DailySummary {
  date: string;
  dayNumber: number;
  income: number;
  expense: number;
  balance: number;
}
