import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionList } from "@/components/budget/transaction-list";
import { monthTransactions, summarizeMonth, useBudgetStore } from "@/lib/budget/store";
import {
  formatMoney,
  formatMonth,
  formatMonthShort,
  monthKey,
  shiftMonth,
} from "@/lib/budget/format";
import { useTranslation } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";
import type { Transaction, TxType } from "@/lib/budget/types";

type Filter = "all" | TxType;

type Props = {
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onAdd: () => void;
};

export function TransactionHistory({ onEdit, onDelete, onAdd }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");

  const transactions = useBudgetStore((s) => s.transactions);
  const categoryBudgets = useBudgetStore((s) => s.categoryBudgets);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const setSelectedMonth = useBudgetStore((s) => s.setSelectedMonth);

  const summary = useMemo(
    () => summarizeMonth(transactions, selectedMonth, categoryBudgets),
    [transactions, selectedMonth, categoryBudgets],
  );
  const items = useMemo(
    () => monthTransactions(transactions, selectedMonth, filter),
    [transactions, selectedMonth, filter],
  );

  const isCurrentMonth = selectedMonth === monthKey();

  return (
    <div className="flex flex-col gap-5">
      <Card className="gradient-card border-0 shadow-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
                {t("history_title")}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {t("history_subtitle")}
              </p>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <History className="size-5 text-primary" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/60 px-1.5 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex min-w-32 flex-col items-center">
              <span className="text-sm font-semibold tabular-nums">
                <span className="sm:hidden">{formatMonthShort(selectedMonth)}</span>
                <span className="hidden sm:inline">{formatMonth(selectedMonth)}</span>
              </span>
              {!isCurrentMonth && (
                <button
                  type="button"
                  onClick={() => setSelectedMonth(monthKey())}
                  className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <RotateCcw className="size-3" />
                  {t("history_this_month")}
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <HistoryStat
              label={t("dashboard_income")}
              value={formatMoney(summary.income)}
              icon={<TrendingUp className="size-3.5 text-emerald-500" />}
              tone="income"
            />
            <HistoryStat
              label={t("dashboard_expenses")}
              value={formatMoney(summary.expenses)}
              icon={<TrendingDown className="size-3.5 text-red-500" />}
              tone="expense"
            />
            <HistoryStat
              label={t("stat_remaining")}
              value={formatMoney(summary.remaining)}
              icon={<Wallet className={cn("size-3.5", summary.remaining < 0 ? "text-red-500" : "text-primary")} />}
              tone={summary.remaining < 0 ? "expense" : undefined}
            />
          </div>
        </CardContent>
      </Card>

      <TransactionList
        items={items}
        filter={filter}
        onFilter={setFilter}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onAdd}
      />
    </div>
  );
}

function HistoryStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "income" | "expense";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-xl bg-secondary/50 px-2.5 py-2.5">
      <div className="flex min-w-0 items-start gap-1.5">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <span className="break-words text-[10px] font-semibold leading-tight text-muted-foreground">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "truncate text-sm font-bold tabular-nums tracking-tight",
          tone === "income" && "text-emerald-600",
          tone === "expense" && "text-red-500",
        )}
      >
        {value}
      </p>
    </div>
  );
}
