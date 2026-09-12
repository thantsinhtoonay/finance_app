import type { TxType } from "./types";
import type { TranslationKeys } from "@/lib/i18n/types";

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

const CATEGORY_I18N: Record<string, string> = {
  housing: "category_housing",
  food: "category_food",
  transport: "category_transport",
  utilities: "category_utilities",
  health: "category_health",
  entertainment: "category_entertainment",
  shopping: "category_shopping",
  other: "category_other",
  salary: "category_salary",
  freelance: "category_freelance",
  investments: "category_investment",
  "other-income": "category_other",
};

export function categoriesFor(type: TxType): CategoryDef[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function categoryById(id: string): CategoryDef {
  return ALL.find((c) => c.id === id) ?? { id, label: id, color: "#a8aaa6" };
}

export function translatedCategoryLabel(id: string, t: (key: keyof TranslationKeys) => string): string {
  const key = CATEGORY_I18N[id];
  return key ? t(key as keyof TranslationKeys) : id;
}

export function defaultCategory(type: TxType): string {
  return type === "income" ? "salary" : "food";
}
