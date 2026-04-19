import { Timestamp } from 'firebase/firestore';

export interface Member {
  id: string;
  name: string;
  color: string;
  initials?: string;
}

export type SplitType = 'equal' | 'exact';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Timestamp;
  paidBy: string; // Member ID
  splitAmong: string[]; // Array of Member IDs
  splitType: SplitType;
  customAmounts?: Record<string, number>; // Member ID -> Amount
  category: string;
  isSettlement: boolean;
}

export interface Settlement {
  from: string; // Member ID
  to: string; // Member ID
  amount: number;
}
