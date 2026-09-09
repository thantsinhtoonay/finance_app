import { create } from "zustand";
import { persist } from "zustand/middleware";
import { categoryById } from "./categories";
import { monthKey, shiftMonth } from "./format";
import { createSeedTransactions } from "./seed";
import type {
  CategoryBudget,
  CategoryTotal,
  MonthSummary,
  RecurringFrequency,
  Transaction,
  TxType,
  YearlySummary,
} from "./types";

type Draft = Omit<Transaction, "id">;

type BudgetState = {
  transactions: Transaction[];
  monthlyGoal: number;
  selectedMonth: string;
  categoryBudgets: CategoryBudget[];
  addTransaction: (draft: Draft) => void;
  updateTransaction: (id: string, draft: Draft) => void;
  deleteTransaction: (id: string) => void;
  setMonthlyGoal: (goal: number) => void;
  setSelectedMonth: (month: string) => void;
  setCategoryBudget: (categoryId: string, limit: number) => void;
  removeCategoryBudget: (categoryId: string) => void;
  generateRecurringTransactions: () => void;
  resetData: () => void;
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      transactions: [],
      monthlyGoal: 3500,
      selectedMonth: monthKey(),
      categoryBudgets: [
        { categoryId: "housing", limit: 2000 },
        { categoryId: "food", limit: 500 },
        { categoryId: "transport", limit: 300 },
        { categoryId: "utilities", limit: 200 },
        { categoryId: "health", limit: 150 },
        { categoryId: "entertainment", limit: 200 },
        { categoryId: "shopping", limit: 250 },
      ],
      addTransaction: (draft) =>
        set((s) => ({
          transactions: [{ ...draft, id: crypto.randomUUID() }, ...s.transactions],
        })),
      updateTransaction: (id, draft) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...draft } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),
      setMonthlyGoal: (monthlyGoal) => set({ monthlyGoal }),
      setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
      setCategoryBudget: (categoryId, limit) =>
        set((s) => {
          const existing = s.categoryBudgets.find((b) => b.categoryId === categoryId);
          if (existing) {
            return {
              categoryBudgets: s.categoryBudgets.map((b) =>
                b.categoryId === categoryId ? { ...b, limit } : b,
              ),
            };
          }
          return { categoryBudgets: [...s.categoryBudgets, { categoryId, limit }] };
        }),
      removeCategoryBudget: (categoryId) =>
        set((s) => ({
          categoryBudgets: s.categoryBudgets.filter((b) => b.categoryId !== categoryId),
        })),
      generateRecurringTransactions: () => {
        const state = get();
        const currentMonth = monthKey();
        const newTransactions: Transaction[] = [];

        const recurring = state.transactions.filter(
          (t) => t.recurring && t.date.startsWith(currentMonth),
        );

        for (const tx of recurring) {
          if (!tx.recurring) continue;
          const nextDate = getNextRecurringDate(tx.date, tx.recurring);
          if (!nextDate.startsWith(currentMonth)) continue;

          const alreadyExists = state.transactions.some(
            (t) =>
              t.recurring === tx.recurring &&
              t.category === tx.category &&
              t.amount === tx.amount &&
              t.date === nextDate,
          );

          if (!alreadyExists) {
            newTransactions.push({
              ...tx,
              id: crypto.randomUUID(),
              date: nextDate,
            });
          }
        }

        if (newTransactions.length > 0) {
          set((s) => ({
            transactions: [...newTransactions, ...s.transactions],
          }));
        }
      },
      resetData: () => {
        localStorage.removeItem("northline-budget-v1");
        set({
          transactions: [],
          monthlyGoal: 3500,
          selectedMonth: monthKey(),
          categoryBudgets: [
            { categoryId: "housing", limit: 2000 },
            { categoryId: "food", limit: 500 },
            { categoryId: "transport", limit: 300 },
            { categoryId: "utilities", limit: 200 },
            { categoryId: "health", limit: 150 },
            { categoryId: "entertainment", limit: 200 },
            { categoryId: "shopping", limit: 250 },
          ],
        });
      },
    }),
    {
      name: "northline-budget-v1",
      partialize: (s) => ({
        transactions: s.transactions,
        monthlyGoal: s.monthlyGoal,
        categoryBudgets: s.categoryBudgets,
      }),
    },
  ),
);

function getNextRecurringDate(lastDate: string, frequency: RecurringFrequency): string {
  const d = new Date(lastDate + "T00:00:00");
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().slice(0, 10);
}

export function summarizeMonth(
  transactions: Transaction[],
  month: string,
  categoryBudgets: CategoryBudget[] = [],
): MonthSummary {
  const monthTxs = transactions.filter((t) => t.date.startsWith(month));
  let income = 0;
  let expenses = 0;
  const bucket = new Map<string, number>();

  for (const t of monthTxs) {
    if (t.type === "income") income += t.amount;
    else {
      expenses += t.amount;
      bucket.set(t.category, (bucket.get(t.category) ?? 0) + t.amount);
    }
  }

  const byCategory: CategoryTotal[] = [...bucket.entries()]
    .map(([id, amount]) => {
      const cat = categoryById(id);
      const budget = categoryBudgets.find((b) => b.categoryId === id);
      return {
        id,
        label: cat.label,
        amount,
        percent: expenses > 0 ? (amount / expenses) * 100 : 0,
        color: cat.color,
        limit: budget?.limit,
        overBudget: budget ? amount > budget.limit : false,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    month,
    income,
    expenses,
    remaining: income - expenses,
    count: monthTxs.length,
    byCategory,
  };
}

export function monthTransactions(
  transactions: Transaction[],
  month: string,
  filter: "all" | TxType = "all",
  search: string = "",
): Transaction[] {
  const q = search.toLowerCase().trim();
  return transactions
    .filter((t) => t.date.startsWith(month))
    .filter((t) => (filter === "all" ? true : t.type === filter))
    .filter((t) =>
      q ? t.note.toLowerCase().includes(q) || categoryById(t.category).label.toLowerCase().includes(q) : true,
    )
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
}

export function previewRemaining(
  summary: MonthSummary,
  draft: { type: TxType; amount: number },
  original?: Transaction | null,
): number {
  let remaining = summary.remaining;
  if (original && original.date.startsWith(summary.month)) {
    remaining += original.type === "income" ? -original.amount : original.amount;
  }
  if (draft.amount > 0) {
    remaining += draft.type === "income" ? draft.amount : -draft.amount;
  }
  return remaining;
}

export function summarizeYear(
  transactions: Transaction[],
  year: string,
  categoryBudgets: CategoryBudget[] = [],
): YearlySummary {
  const yearNum = parseInt(year, 10);
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = `${year}-${String(i + 1).padStart(2, "0")}`;
    const summary = summarizeMonth(transactions, m, categoryBudgets);
    return {
      month: m,
      label: new Date(yearNum, i).toLocaleString("en", { month: "short" }),
      income: summary.income,
      expenses: summary.expenses,
      savings: summary.remaining,
    };
  });

  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpenses = months.reduce((s, m) => s + m.expenses, 0);

  const catBucket = new Map<string, number>();
  for (const tx of transactions.filter((t) => t.date.startsWith(year) && t.type === "expense")) {
    catBucket.set(tx.category, (catBucket.get(tx.category) ?? 0) + tx.amount);
  }
  const topCategories: CategoryTotal[] = [...catBucket.entries()]
    .map(([id, amount]) => {
      const cat = categoryById(id);
      return {
        id,
        label: cat.label,
        amount,
        percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: cat.color,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  return {
    year,
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    monthlyBreakdown: months,
    topCategories,
  };
}

export function exportToCsv(transactions: Transaction[], month?: string): string {
  const txs = month
    ? transactions.filter((t) => t.date.startsWith(month))
    : transactions;

  const header = "Date,Type,Category,Amount,Note,Recurring";
  const rows = txs
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) => {
      const cat = categoryById(t.category);
      const note = t.note.replace(/"/g, '""');
      return `${t.date},${t.type},"${cat.label}",${t.amount},"${note}",${t.recurring || ""}`;
    });

  return [header, ...rows].join("\n");
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
