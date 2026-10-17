import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Lock, Paperclip, Repeat } from "lucide-react";
import { motion } from "framer-motion";
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
import { categoriesFor, defaultCategory, translatedCategoryLabel } from "@/lib/budget/categories";
import { defaultDateForMonth, formatMoney, parseAmount } from "@/lib/budget/format";
import { compressReceiptImage } from "@/lib/budget/receipt-image";
import { fetchReceipt, previewRemaining, SaveError } from "@/lib/budget/store";
import type { MonthSummary, RecurringFrequency, Transaction, TxType } from "@/lib/budget/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/store";
import type { TranslationKeys } from "@/lib/i18n/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: string;
  summary: MonthSummary;
  editing: Transaction | null;
  hasIncome: boolean;
  onSubmit: (draft: {
    type: TxType;
    amount: number;
    category: string;
    date: string;
    note: string;
    recurring?: RecurringFrequency | null;
    receipt?: string | null;
  }) => Promise<void>;
};

export function TransactionDialog({
  open,
  onOpenChange,
  month,
  summary,
  editing,
  hasIncome,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(defaultCategory("expense"));
  const [date, setDate] = useState(defaultDateForMonth(month));
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState<RecurringFrequency | "">("");
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptDirty, setReceiptDirty] = useState<"set" | "removed" | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setReceipt(null);
    setReceiptDirty(null);
    setReceiptLoading(false);
    setShowReceipt(false);
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setDate(editing.date);
      setNote(editing.note);
      setRecurring(editing.recurring || "");
      if (typeof editing.receipt === "string" && editing.receipt) {
        setReceipt(editing.receipt);
      } else if (editing.hasReceipt) {
        // Image not in memory (list rows carry only the flag) — fetch on demand.
        let cancelled = false;
        setReceiptLoading(true);
        fetchReceipt(editing.id)
          .then((url) => {
            if (!cancelled && url) setReceipt(url);
          })
          .catch(() => {})
          .finally(() => {
            if (!cancelled) setReceiptLoading(false);
          });
        return () => {
          cancelled = true;
        };
      }
    } else {
      // Income-first gate: while no income exists the dialog opens on income.
      const startType: TxType = hasIncome ? "expense" : "income";
      setType(startType);
      setAmount("");
      setCategory(defaultCategory(startType));
      setDate(defaultDateForMonth(month));
      setNote("");
      setRecurring("");
    }
  }, [open, editing, month, hasIncome]);

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

  async function handleReceiptPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setReceiptLoading(true);
    try {
      const dataUrl = await compressReceiptImage(file);
      setReceipt(dataUrl);
      setReceiptDirty("set");
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? t(err.message as keyof TranslationKeys)
          : t("receipt_error_decode"),
      );
    } finally {
      setReceiptLoading(false);
    }
  }

  function handleReceiptRemove() {
    setReceipt(null);
    setReceiptDirty("removed");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseAmount(amount);
    if (value === null) {
      setError(t("dialog_error_zero_amount"));
      return;
    }
    if (!date) {
      setError(t("dialog_error_no_date"));
      return;
    }
    if (type === "expense" && !hasIncome) {
      setError(t("dialog_error_income_first"));
      return;
    }
    try {
      await onSubmit({
        type,
        amount: value,
        category,
        date,
        note: note.trim(),
        recurring: recurring || null,
        // undefined = leave unchanged (PUT), null = remove, string = attach.
        ...(receiptDirty === "set" && receipt
          ? { receipt }
          : receiptDirty === "removed"
            ? { receipt: null }
            : {}),
      });
      onOpenChange(false);
    } catch (err) {
      if (err instanceof SaveError && err.status === 409) {
        setError(t("dialog_error_income_first"));
      } else {
        setError(t("dialog_error_save_failed"));
      }
    }
  }

  const recurringOptions: { value: RecurringFrequency; key: keyof TranslationKeys }[] = [
    { value: "weekly", key: "recurring_weekly" },
    { value: "biweekly", key: "recurring_biweekly" },
    { value: "monthly", key: "recurring_monthly" },
    { value: "yearly", key: "recurring_yearly" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{editing ? t("dialog_edit_entry") : t("dialog_add_entry")}</DialogTitle>
          <DialogDescription>
            {editing ? t("dialog_edit_desc") : t("dialog_add_desc")}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/80 border border-border/50 p-1">
            {(["expense", "income"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleType(option)}
                disabled={option === "expense" && !hasIncome}
                aria-disabled={option === "expense" && !hasIncome}
                className={cn(
                  "relative h-11 overflow-hidden rounded-lg text-sm font-semibold capitalize transition-colors duration-200",
                  type === option ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                  option === "expense" && !hasIncome && "opacity-40 cursor-not-allowed hover:bg-transparent",
                )}
              >
                {type === option && (
                  <motion.span
                    layoutId="txTypePill"
                    className={cn(
                      "absolute inset-0 shadow-md",
                      option === "income"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30"
                        : "gradient-gold shadow-primary/25",
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {option === "expense" && !hasIncome ? <Lock className="size-3.5" /> : null}
                  {option === "expense" ? t("transaction_expense") : t("transaction_income")}
                </span>
              </button>
            ))}
          </div>

          {!hasIncome ? (
            <p className="flex items-start gap-1.5 text-xs font-medium text-amber-500">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              {t("dialog_error_income_first")}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-sm font-semibold">{t("dialog_amount")}</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ""))}
              className="text-2xl font-bold tabular-nums h-14"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category" className="text-sm font-semibold">{t("dialog_category")}</Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  // Radix fires an empty reset when the option list swaps on a
                  // type switch; "" is never a valid category — keep the last
                  // choice (handleType already set the correct default).
                  if (v) setCategory(v);
                }}
              >
                <SelectTrigger id="category" aria-label={t("dialog_category")} className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {translatedCategoryLabel(c.id, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-sm font-semibold">{t("dialog_date")}</Label>
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
                {t("dialog_recurring")}
              </span>
            </Label>
            <Select value={recurring} onValueChange={(v) => setRecurring(v as RecurringFrequency | "")}>
              <SelectTrigger id="recurring" aria-label={t("dialog_recurring")} className="h-11">
                <SelectValue placeholder={t("dialog_one_time")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("dialog_one_time")}</SelectItem>
                {recurringOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note" className="text-sm font-semibold">{t("dialog_note")}</Label>
            <Input
              id="note"
              placeholder={t("dialog_optional")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={80}
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Paperclip className="size-3.5" />
              {t("dialog_receipt")}
            </Label>
            <input
              ref={receiptFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReceiptPick}
            />
            {receiptLoading ? (
              <div className="flex h-16 items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 text-xs font-medium text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("dialog_receipt_loading")}
              </div>
            ) : receipt ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowReceipt(true)}
                  aria-label={t("dialog_receipt_view")}
                  className="size-16 shrink-0 overflow-hidden rounded-xl border border-border/60 transition-opacity hover:opacity-80"
                >
                  <img
                    src={receipt}
                    alt={t("dialog_receipt")}
                    className="size-full object-cover"
                  />
                </button>
                <div className="flex flex-col gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => receiptFileRef.current?.click()}
                  >
                    {t("dialog_receipt_replace")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-muted-foreground"
                    onClick={handleReceiptRemove}
                  >
                    {t("dialog_receipt_remove")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="justify-start rounded-xl border-dashed text-muted-foreground"
                onClick={() => receiptFileRef.current?.click()}
              >
                <Paperclip className="size-4" />
                {t("dialog_receipt_add")}
              </Button>
            )}
          </div>

          <div className="rounded-xl bg-secondary/80 border border-border/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {t("dialog_remaining_after")}{" "}
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  nextRemaining < 0 ? "text-expense" : "text-foreground",
                )}
              >
                {formatMoney(nextRemaining)}
              </span>
            </p>
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              {t("cancel")}
            </Button>
            <Button type="submit" className="shadow-lg shadow-primary/30">
              {editing ? t("dialog_save_changes") : t("dialog_add_entry")}
            </Button>
          </div>
        </form>

        {showReceipt && receipt ? (
          <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
            <DialogContent className="sm:max-w-2xl p-3">
              <DialogTitle className="sr-only">{t("dialog_receipt")}</DialogTitle>
              <img
                src={receipt}
                alt={t("dialog_receipt")}
                className="mx-auto max-h-[75vh] w-auto rounded-xl"
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
