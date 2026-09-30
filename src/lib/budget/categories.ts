import type { TxType } from "./types";
import type { TranslationKeys } from "@/lib/i18n/types";

export type CategoryDef = {
  id: string;
  label: string;
  color: string;
};

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: "food", label: "Food", color: "#d0aa88" },
  { id: "grocery", label: "Groceries", color: "#b9c985" },
  { id: "housing", label: "Housing", color: "#9fbe98" },
  { id: "transport", label: "Transport", color: "#8fa4b3" },
  { id: "utilities", label: "Utilities", color: "#86b8b0" },
  { id: "health", label: "Health", color: "#d0948c" },
  { id: "education", label: "Education", color: "#a39dc9" },
  { id: "entertainment", label: "Entertainment", color: "#cbb89a" },
  { id: "shopping", label: "Shopping", color: "#b3bc86" },
  { id: "personal", label: "Personal Care", color: "#d3a3b4" },
  { id: "subscription", label: "Subscriptions", color: "#9aa0d6" },
  { id: "travel", label: "Travel", color: "#7ec3e0" },
  { id: "fitness", label: "Fitness & Sports", color: "#d98d5f" },
  { id: "gift", label: "Gifts & Donations", color: "#d9b06a" },
  { id: "insurance", label: "Insurance", color: "#92a5bb" },
  { id: "fees", label: "Bank Fees", color: "#b5aca0" },
  { id: "other", label: "Other", color: "#a8aaa6" },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: "salary", label: "Salary", color: "#9fbe98" },
  { id: "freelance", label: "Freelance", color: "#86b8b0" },
  { id: "business", label: "Business", color: "#8fbcd4" },
  { id: "investments", label: "Investments", color: "#8fa4b3" },
  { id: "rental", label: "Rental Income", color: "#b9c985" },
  { id: "bonus", label: "Bonus", color: "#d9b06a" },
  { id: "refund", label: "Refunds & Cashback", color: "#a39dc9" },
  { id: "gift-income", label: "Gifts Received", color: "#d3a3b4" },
  { id: "other-income", label: "Other", color: "#a8aaa6" },
];

const ALL = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const CATEGORY_I18N: Record<string, string> = {
  food: "category_food",
  grocery: "category_grocery",
  housing: "category_housing",
  transport: "category_transport",
  utilities: "category_utilities",
  health: "category_health",
  education: "category_education",
  entertainment: "category_entertainment",
  shopping: "category_shopping",
  personal: "category_personal",
  subscription: "category_subscription",
  travel: "category_travel",
  fitness: "category_fitness",
  gift: "category_gift",
  insurance: "category_insurance",
  fees: "category_fees",
  other: "category_other",
  salary: "category_salary",
  freelance: "category_freelance",
  business: "category_business",
  investments: "category_investment",
  rental: "category_rental",
  bonus: "category_bonus",
  refund: "category_refund",
  "gift-income": "category_gift_income",
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
