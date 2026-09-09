import { useEffect, useMemo, useState } from "react";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesFor, defaultCategory } from "@/lib/budget/categories";
import { defaultDateForMonth, formatMoney, parseAmount } from "@/lib/budget/format";
import { previewRemaining } from "@/lib/budget/store";
import type { MonthSummary, RecurringFrequency, Transaction, TxType } from "@/lib/budget/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  summary: MonthSummary;
  editing: Transaction | null;
  onSubmit: (draft: {
    type: TxType;
    amount: number;
    category: string;
    date: string;
    note: string;
    recurring?: RecurringFrequency | null;
  }) => void;
};

const RECURRING_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function TransactionDialog({
  open,
  onOpenChange,
  month,
  summary,
  editing,
  onSubmit,
}: Props) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(defaultCategory("expense"));
  const [date, setDate] = useState(defaultDateForMonth(month));
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState<RecurringFrequency | "">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setDate(editing.date);
      setNote(editing.note);
      setRecurring(editing.recurring || "");
    } else {
      setType("expense");
      setAmount("");
      setCategory(defaultCategory("expense"));
      setDate(defaultDateForMonth(month));
      setNote("");
      setRecurring("");
    }
    setError(null);
  }, [open, editing, month]);

  const cats = categoriesFor(type);
  const parsed = parseAmount(amount);
  const nextRemaining = useMemo(
    () => previewRemaining(summary, { type, amount: parsed ?? 0 }, editing),
    [summary, type, parsed, editing],
  );

  function handleType(next: TxType) {
    setType(next);
    const ids = categoriesFor(next).map((c) => c.id);
    if (!ids.includes(category)) setCategory(defaultCategory(next));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseAmount(amount);
    if (value === null) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!date) {
      setError("Choose a date.");
      return;
    }
    onSubmit({
      type,
      amount: value,
      category,
      date,
      note: note.trim(),
      recurring: recurring || null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{editing ? "Edit entry" : "Add entry"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update this income or expense." : "Log income or an expense for your budget."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
            {(["expense", "income"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleType(option)}
                className={cn(
                  "h-10 rounded-lg text-sm font-semibold capitalize transition-all duration-200",
                  type === option
                    ? option === "income"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-sm font-semibold">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-bold tabular-nums h-14"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" aria-label="Category" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-sm font-semibold">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="recurring" className="text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <Repeat className="size-3.5" />
                Recurring
              </span>
            </Label>
            <Select value={recurring} onValueChange={(v) => setRecurring(v as RecurringFrequency | "")}>
              <SelectTrigger id="recurring" aria-label="Recurring frequency" className="h-11">
                <SelectValue placeholder="One-time (none)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">One-time</SelectItem>
                {RECURRING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note" className="text-sm font-semibold">Note</Label>
            <Input
              id="note"
              placeholder="Optional"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={80}
              className="h-11"
            />
          </div>

          <div className="rounded-xl bg-secondary/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Remaining after this:{" "}
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  nextRemaining < 0 ? "text-red-500" : "text-foreground",
                )}
              >
                {formatMoney(nextRemaining)}
              </span>
            </p>
          </div>

          {error ? (
            <p className="text-sm font-medium text-red-500">{error}</p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="gradient-purple text-white shadow-lg shadow-primary/25 rounded-xl">
              {editing ? "Save changes" : "Add entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
