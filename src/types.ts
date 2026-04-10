export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  user_id?: string;
}

export interface SavingsGoal {
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  name: string;
  user_id?: string;
}

export type Currency = 'USD' | 'KES';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  customCategories?: string[];
  income?: number;
  currency?: Currency;
}

export type Category = 'Food' | 'Transport' | 'Entertainment' | 'Health' | 'Bills' | 'Shopping' | 'Other';
