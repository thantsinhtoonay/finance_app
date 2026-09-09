import type { TxType } from "./types";

export type CategoryDef = {
  id: string;
  label: string;
  color: string;
};

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: "housing", label: "Housing", color: "#9fbe98" },
  { id: "food", label: "Food", color: "#d0aa88" },
  { id: "transport", label: "Transport", color: "#8fa4b3" },
  { id: "utilities", label: "Utilities", color: "#86b8b0" },
  { id: "health", label: "Health", color: "#d0948c" },
  { id: "entertainment", label: "Entertainment", color: "#cbb89a" },
  { id: "shopping", label: "Shopping", color: "#b3bc86" },
  { id: "other", label: "Other", color: "#a8aaa6" },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: "salary", label: "Salary", color: "#9fbe98" },
  { id: "freelance", label: "Freelance", color: "#86b8b0" },
  { id: "investments", label: "Investments", color: "#8fa4b3" },
  { id: "other-income", label: "Other", color: "#a8aaa6" },
];

const ALL = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function categoriesFor(type: TxType): CategoryDef[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function categoryById(id: string): CategoryDef {
  return ALL.find((c) => c.id === id) ?? { id, label: id, color: "#a8aaa6" };
}

export function defaultCategory(type: TxType): string {
  return type === "income" ? "salary" : "food";
}
