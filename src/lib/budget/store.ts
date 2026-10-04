import { create } from "zustand";
import { categoryById } from "./categories";
import { monthKey } from "./format";
import type {
  CategoryBudget,
  CategoryTotal,
  MonthSummary,
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
  loaded: boolean;
  addTransaction: (draft: Draft) => Promise<void>;
  updateTransaction: (id: string, draft: Draft) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setMonthlyGoal: (goal: number) => Promise<void>;
  setSelectedMonth: (month: string) => void;
  setCategoryBudget: (categoryId: string, limit: number) => Promise<void>;
  removeCategoryBudget: (categoryId: string) => Promise<void>;
  loadFromServer: () => Promise<void>;
  resetData: () => Promise<void>;
};

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (res.status === 401) {
    // Telegram-only app: back to the entry route, which auto-signs-in via
    // Mini App initData (or shows the landing page outside Telegram).
    window.location.href = "/";
    throw new Error("Unauthorized");
  }
  return res;
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  transactions: [],
      monthlyGoal: 0,
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
  loaded: false,

  loadFromServer: async () => {
    try {
      const [txRes, budgetRes, settingsRes] = await Promise.all([
        apiFetch("/api/transactions/"),
        apiFetch("/api/budgets/"),
        apiFetch("/api/settings/"),
      ]);

      if (txRes.ok) {
        const rows = await txRes.json();
        const transactions = rows.map((t: any) => ({
          ...t,
          amount: Number(t.amount),
        }));
        set({ transactions });
      } else {
        console.error("Failed to load transactions:", txRes.status);
      }

      if (budgetRes.ok) {
        const rows = await budgetRes.json();
        const categoryBudgets = rows.map((b: any) => ({
          ...b,
          limit: Number(b.limit),
        }));
        if (categoryBudgets.length > 0) {
          set({ categoryBudgets });
        }
      } else {
        console.error("Failed to load budgets:", budgetRes.status);
      }

      if (settingsRes.ok) {
        const { monthlyGoal } = await settingsRes.json();
        set({ monthlyGoal: Number(monthlyGoal) });
      } else {
        console.error("Failed to load settings:", settingsRes.status);
      }

      set({ loaded: true });
    } catch (err) {
      console.error("Failed to load data from server:", err);
      set({ loaded: true });
    }
  },

  addTransaction: async (draft) => {
    const id = crypto.randomUUID();
    const tempTx = { ...draft, id };
    set((s) => ({ transactions: [tempTx, ...s.transactions] }));

    try {
      const res = await apiFetch("/api/transactions/", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const saved = await res.json();
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? saved : t)),
        }));
      } else {
        console.error("Failed to save transaction:", res.status);
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
      }
    } catch (err) {
      console.error("Failed to save transaction:", err);
      set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    }
  },

  updateTransaction: async (id, draft) => {
    const prev = get().transactions;
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...draft } : t)),
    }));

    try {
      const res = await apiFetch(`/api/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      if (!res.ok) set({ transactions: prev });
    } catch {
      set({ transactions: prev });
    }
  },

  deleteTransaction: async (id) => {
    const prev = get().transactions;
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));

    try {
      const res = await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) set({ transactions: prev });
    } catch {
      set({ transactions: prev });
    }
  },

  setMonthlyGoal: async (monthlyGoal) => {
    const prev = get().monthlyGoal;
    set({ monthlyGoal });

    try {
      const res = await apiFetch("/api/settings/", {
        method: "PUT",
        body: JSON.stringify({ monthlyGoal }),
      });
      if (!res.ok) set({ monthlyGoal: prev });
    } catch {
      set({ monthlyGoal: prev });
    }
  },

  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),

  setCategoryBudget: async (categoryId, limit) => {
    const prev = get().categoryBudgets;
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
    });

    try {
      const res = await apiFetch("/api/budgets/", {
        method: "PUT",
        body: JSON.stringify({ categoryId, limit }),
      });
      if (!res.ok) set({ categoryBudgets: prev });
    } catch {
      set({ categoryBudgets: prev });
    }
  },

  removeCategoryBudget: async (categoryId) => {
    const prev = get().categoryBudgets;
    set((s) => ({
      categoryBudgets: s.categoryBudgets.filter((b) => b.categoryId !== categoryId),
    }));

    try {
      const res = await apiFetch("/api/budgets/", {
        method: "DELETE",
        body: JSON.stringify({ categoryId }),
      });
      if (!res.ok) set({ categoryBudgets: prev });
    } catch {
      set({ categoryBudgets: prev });
    }
  },

  resetData: async () => {
    set({
      transactions: [],
  monthlyGoal: 0,
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

    try {
      // Clear everything server-side: transactions, per-category budgets, and
      // the monthly goal — otherwise a reload resurrects them.
      const results = await Promise.all([
        apiFetch("/api/transactions/", { method: "DELETE" }),
        apiFetch("/api/budgets/", { method: "DELETE" }),
        apiFetch("/api/settings/", {
          method: "PUT",
          body: JSON.stringify({ monthlyGoal: 0 }),
        }),
      ]);
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        console.error(
          "Clear all data: some server data could not be deleted:",
          failed.map((r) => r.status),
        );
      }
    } catch (err) {
      console.error("Failed to clear data from server:", err);
    }
  },
}));

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
): Transaction[] {
  return transactions
    .filter((t) => t.date.startsWith(month))
    .filter((t) => (filter === "all" ? true : t.type === filter))
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
