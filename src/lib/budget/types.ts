export type TxType = "income" | "expense";

export type RecurringFrequency = "weekly" | "biweekly" | "monthly" | "yearly";

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  date: string;
  note: string;
  recurring?: RecurringFrequency | null;
};

export type CategoryBudget = {
  categoryId: string;
  limit: number;
};

export type MonthSummary = {
  month: string;
  income: number;
  expenses: number;
  remaining: number;
  count: number;
  byCategory: CategoryTotal[];
};

export type CategoryTotal = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
  limit?: number;
  overBudget?: boolean;
};

export type YearlySummary = {
  year: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  monthlyBreakdown: {
    month: string;
    label: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
  topCategories: CategoryTotal[];
};

export type AppData = {
  version: 1;
  transactions: Transaction[];
  monthlyGoal: number;
  categoryBudgets: CategoryBudget[];
  exportedAt: string;
};
