export interface Expense {
  id: string;
  amount: number;
  date: Date;
  category: string;
  description?: string; // Optional description
}

export interface DebtCredit {
  id: string;
  person: string;
  amount: number;
  type: 'debt' | 'credit'; // 'debt' means you owe them, 'credit' means they owe you
  date: Date;
  description?: string; // Optional description
}
