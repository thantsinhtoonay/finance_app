import type { Transaction } from "./types";
import { monthKey } from "./format";

function d(month: string, day: number): string {
  return `${month}-${String(day).padStart(2, "0")}`;
}

export function createSeedTransactions(month = monthKey()): Transaction[] {
  return [
    { id: "seed-1", type: "income", amount: 5400, category: "salary", date: d(month, 1), note: "Monthly salary" },
    { id: "seed-2", type: "income", amount: 650, category: "freelance", date: d(month, 12), note: "Design retainer" },
    { id: "seed-3", type: "expense", amount: 1850, category: "housing", date: d(month, 1), note: "Rent" },
    { id: "seed-4", type: "expense", amount: 79.99, category: "utilities", date: d(month, 4), note: "Internet" },
    { id: "seed-5", type: "expense", amount: 127, category: "transport", date: d(month, 2), note: "Transit pass" },
    { id: "seed-6", type: "expense", amount: 142.3, category: "food", date: d(month, 3), note: "Groceries" },
    { id: "seed-7", type: "expense", amount: 15.99, category: "entertainment", date: d(month, 5), note: "Streaming" },
    { id: "seed-8", type: "expense", amount: 6.5, category: "food", date: d(month, 6), note: "Coffee" },
    { id: "seed-9", type: "expense", amount: 94.5, category: "utilities", date: d(month, 8), note: "Electric" },
    { id: "seed-10", type: "expense", amount: 52.4, category: "transport", date: d(month, 9), note: "Gas" },
    { id: "seed-11", type: "expense", amount: 32.8, category: "health", date: d(month, 10), note: "Pharmacy" },
    { id: "seed-12", type: "expense", amount: 64, category: "entertainment", date: d(month, 14), note: "Dinner out" },
    { id: "seed-13", type: "expense", amount: 88.14, category: "food", date: d(month, 17), note: "Groceries" },
    { id: "seed-14", type: "expense", amount: 89, category: "shopping", date: d(month, 20), note: "Running shoes" },
  ];
}
