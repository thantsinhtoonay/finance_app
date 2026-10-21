import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Keyboard,
  Loader2,
  Plus,
  RotateCcw,
  Settings as SettingsIcon,
  Trash2,
  User,
  Wallet,
  TrendingUp,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBudgets } from "@/components/budget/category-budgets";
import { SavingsGoal } from "@/components/budget/savings-goal";
import { TransactionDialog } from "@/components/budget/transaction-dialog";
import { TransactionList } from "@/components/budget/transaction-list";

import { BottomNav } from "@/components/budget/bottom-nav";
import { LanguageIconToggle } from "@/lib/i18n/components/language-toggle";
import { useSettingsStore } from "@/lib/settings/store";
import {
  buildBackupData,
  downloadFile,
  exportToCsv,
  monthTransactions,
  summarizeMonth,
  useBudgetStore,
} from "@/lib/budget/store";
import { parseTransactionInput, isIsoDate } from "@/lib/budget/validation";
import type { AppData, Transaction, TxType } from "@/lib/budget/types";
import {
  formatMoney,
  formatMonth,
  formatMonthShort,
  monthKey,
  shiftMonth,
  yearKey,
} from "@/lib/budget/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/store";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { motion, AnimatePresence } from "framer-motion";

// Chart + secondary views load after first paint — recharts/settings/history
// stay out of the critical hydration path (~350 kB smaller entry chunk).
const CategoryChart = lazy(() =>
  import("@/components/budget/category-chart").then((m) => ({ default: m.CategoryChart })),
);
const YearlyOverview = lazy(() =>
  import("@/components/budget/yearly-overview").then((m) => ({ default: m.YearlyOverview })),
);
const TransactionHistory = lazy(() =>
  import("@/components/budget/history").then((m) => ({ default: m.TransactionHistory })),
);
const SettingsPage = lazy(() =>
  import("@/components/budget/settings").then((m) => ({ default: m.Settings })),
);

function ViewFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label={t("loading")}>
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  );
}

type Filter = "all" | TxType;
type View = "dashboard" | "history" | "yearly" | "settings";

export function Dashboard() {
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [view, setView] = useState<View>("dashboard");

  const { t } = useTranslation();
  const user = useCurrentUser();

  const transactions = useBudgetStore((s) => s.transactions);
  const monthlyGoal = useBudgetStore((s) => s.monthlyGoal);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const categoryBudgets = useBudgetStore((s) => s.categoryBudgets);
  const addTransaction = useBudgetStore((s) => s.addTransaction);
  const updateTransaction = useBudgetStore((s) => s.updateTransaction);
  const deleteTransaction = useBudgetStore((s) => s.deleteTransaction);
  const setMonthlyGoal = useBudgetStore((s) => s.setMonthlyGoal);
  const setSelectedMonth = useBudgetStore((s) => s.setSelectedMonth);
  const resetData = useBudgetStore((s) => s.resetData);
  const loadFromServer = useBudgetStore((s) => s.loadFromServer);
  const loaded = useBudgetStore((s) => s.loaded);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const summary = useMemo(
    () => summarizeMonth(transactions, selectedMonth, categoryBudgets),
    [transactions, selectedMonth, categoryBudgets],
  );
  const items = useMemo(
    () => monthTransactions(transactions, selectedMonth, filter),
    [transactions, selectedMonth, filter],
  );

  const leftover = summary.remaining - monthlyGoal;
  const overspent = summary.remaining < 0;
  const goalMet = summary.remaining >= monthlyGoal && monthlyGoal > 0;

  const currentYear = yearKey();
  const isCurrentMonth = selectedMonth === monthKey();

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setDialogOpen(true);
  }

  function handleExportCsv() {
    const csv = exportToCsv(transactions, selectedMonth);
    const filename = `northline-${selectedMonth}.csv`;
    downloadFile(csv, filename, "text/csv;charset=utf-8");
  }

  async function handleExportJson() {
    // Backups include full receipt images (fetched on demand from the server).
    const data = await buildBackupData();
    downloadFile(JSON.stringify(data, null, 2), "northline-backup.json", "application/json");
  }

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as AppData;
        if (data.version !== 1 || !Array.isArray(data.transactions)) {
          alert(t("error_backup_format"));
          return;
        }
        // Re-validate every row through the same parser the API uses — a
        // crafted backup must not smuggle arbitrary strings (receipt URLs,
        // oversized notes, junk dates) into state and later into <img src>.
        const valid: Transaction[] = [];
        for (const tx of data.transactions) {
          const parsed = parseTransactionInput({
            type: tx?.type,
            amount: tx?.amount,
            category: tx?.category,
            date: tx?.date,
            note: tx?.note ?? "",
            recurring: tx?.recurring ?? null,
            receipt: tx?.receipt ?? undefined,
          });
          if (!parsed.ok) continue;
          if (typeof tx.id !== "string" || !tx.id) continue;
          valid.push({
            id: tx.id,
            ...parsed.value,
            note: parsed.value.note ?? "",
          });
        }
        if (valid.length !== data.transactions.length) {
          alert(
            t("error_backup_skipped").replace("{n}", String(data.transactions.length - valid.length)),
          );
        }
        if (!confirm(t("confirm_import").replace("{n}", String(valid.length)))) {
          return;
        }
        // Income-first gate: an import may never introduce expenses while no income exists.
        const importHasExpense = valid.some((tx) => tx.type === "expense");
        const importHasIncome = valid.some((tx) => tx.type === "income");
        const hasIncome =
          importHasIncome ||
          useBudgetStore.getState().transactions.some((tx) => tx.type === "income");
        if (importHasExpense && !hasIncome) {
          alert(t("dialog_error_income_first"));
          return;
        }
        const monthlyGoal =
          typeof data.monthlyGoal === "number" && Number.isFinite(data.monthlyGoal) && data.monthlyGoal >= 0
            ? data.monthlyGoal
            : 0;
        const categoryBudgets = Array.isArray(data.categoryBudgets)
          ? data.categoryBudgets.filter(
              (b) =>
                b &&
                typeof b.categoryId === "string" &&
                typeof b.limit === "number" &&
                Number.isFinite(b.limit) &&
                b.limit >= 0,
            )
          : [];
        useBudgetStore.setState({
          transactions: valid,
          monthlyGoal,
          categoryBudgets,
        });
      } catch {
        alert(t("error_backup_parse"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openAdd();
      } else if (e.key === "Escape") {
        setDialogOpen(false);
        setPendingDelete(null);
        setShowShortcuts(false);
      } else if (e.key === "?" && !e.shiftKey) {
        setShowShortcuts((s) => !s);
      }
    },
    [],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
    <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col overflow-hidden">
      <header className="z-40 shrink-0 border-b border-border/30 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm shadow-black/5">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <motion.img
              src="/images/logo.jpg"
              alt="Shal Su"
              className="size-10 rounded-full object-cover shadow-lg shadow-primary/10 ring-1 ring-primary/15"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            />
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight">{t("app_name")}</h1>
              <p className="truncate text-xs text-muted-foreground">{t("dashboard_budget")}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex items-center gap-0.5 rounded-full bg-secondary/60 backdrop-blur-sm p-1 border border-border/30">
              <Button
                variant={view === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("dashboard")}
                className="rounded-full px-4 text-xs"
              >
                {t("time_monthly")}
              </Button>
              <Button
                variant={view === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("yearly")}
                className="rounded-full px-3 text-xs"
              >
                <CalendarDays className="size-3.5" />
                {t("time_yearly")}
              </Button>
            </div>

            <Button
              size="sm"
              onClick={openAdd}
              className="hidden sm:flex gap-1.5 rounded-full px-4"
              aria-label={t("transaction_add")}
            >
              <Plus className="size-4" />
              {t("add")}
            </Button>

            <LanguageIconToggle />
            <Button
              variant="ghost"
              size="icon"
              className="size-10 hidden sm:flex rounded-full"
              onClick={() => setView("settings")}
              aria-label={t("nav_settings")}
            >
              <SettingsIcon className="size-4.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-36 sm:px-6 sm:pb-6" id="main-scroll">
        <AnimatePresence mode="wait">
          {view === "settings" ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="py-6"
            >
              <Suspense fallback={<ViewFallback />}>
                <SettingsPage onBack={() => setView("dashboard")} />
              </Suspense>
            </motion.div>
          ) : view === "history" ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="py-6"
            >
              <Suspense fallback={<ViewFallback />}>
                <TransactionHistory onEdit={openEdit} onDelete={setPendingDelete} onAdd={openAdd} />
              </Suspense>
            </motion.div>
          ) : view === "yearly" ? (
            <motion.div
              key="yearly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="py-6"
            >
              <Suspense fallback={<ViewFallback />}>
                <YearlyOverview year={currentYear} />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col gap-5 py-6"
            >
            <Card className="gradient-card border-0 shadow-card">
              <CardContent className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
                      {t("dashboard_remaining")}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-2xl sm:text-3xl font-bold tracking-tight tabular-nums lg:text-4xl",
                        overspent ? "text-expense" : "text-gradient",
                      )}
                    >
                      {formatMoney(summary.remaining)}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10"
                      onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                      aria-label={t("aria_prev_month")}
                    >
                      <ChevronLeft />
                    </Button>
                    <p className="min-w-20 sm:min-w-24 text-center text-xs sm:text-sm font-semibold tabular-nums">
                      <span className="sm:hidden">{formatMonthShort(selectedMonth)}</span>
                      <span className="hidden sm:inline">{formatMonth(selectedMonth)}</span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10"
                      onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                      aria-label={t("aria_next_month")}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                </div>

                {!isCurrentMonth && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMonth(monthKey())}
                    className="w-fit gap-1.5"
                  >
                    <RotateCcw className="size-3.5" />
                    {t("nav_home")}
                  </Button>
                )}

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <StatCard
                    label={t("dashboard_income")}
                    value={formatMoney(summary.income)}
                    icon={<TrendingUp className="size-3.5 sm:size-4 text-income" />}
                    tone="income"
                  />
                  <StatCard
                    label={t("dashboard_expenses")}
                    value={formatMoney(summary.expenses)}
                    icon={<Wallet className="size-3.5 sm:size-4 text-expense" />}
                    tone="expense"
                  />
                  <StatCard
                    label={t("savings_goal")}
                    value={formatMoney(monthlyGoal)}
                    icon={<TrendingUp className="size-3.5 sm:size-4 text-primary" />}
                    tone={leftover < 0 ? "expense" : leftover > 0 ? "income" : undefined}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
              <Suspense fallback={<ViewFallback />}>
              <CategoryChart categories={summary.byCategory} total={summary.expenses} />
            </Suspense>
              <SavingsGoal
                goal={monthlyGoal}
                remaining={summary.remaining}
                onChangeGoal={setMonthlyGoal}
              />
            </div>

            <CategoryBudgets
              categories={summary.byCategory}
              categoryBudgets={categoryBudgets}
            />

            <TransactionList
              items={items}
              filter={filter}
              onFilter={setFilter}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onAdd={openAdd}
            />
          </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        month={selectedMonth}
        summary={summary}
        editing={editing}
        hasIncome={
          !loaded ||
          transactions.some((tx) => tx.type === "income" && (!editing || tx.id !== editing.id))
        }
        onSubmit={(draft) =>
          editing ? updateTransaction(editing.id, draft) : addTransaction(draft)
        }
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("msg_confirm_delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? t("msg_remove_confirm").replace(
                    "{name}",
                    pendingDelete.note || t("transaction_delete"),
                  )
                : t("data_clear_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) deleteTransaction(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("shortcuts_title")}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 text-sm">
            <ShortcutRow keys="N" desc={t("transaction_add")} />
            <ShortcutRow keys="?" desc={t("close")} />
            <ShortcutRow keys="Esc" desc={t("close")} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("close")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

      <BottomNav active={view} onChange={setView} onAdd={openAdd} />
    </>
  );
}

function StatCard({
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex min-w-0 flex-col gap-1.5 rounded-xl bg-secondary/50 px-2 py-2.5 sm:gap-2 sm:px-4 sm:py-3"
    >
      <div className="flex items-start gap-1.5 min-w-0">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground leading-tight break-words">{label}</span>
      </div>
      <p
        className={cn(
          "text-[11px] sm:text-base font-bold tabular-nums tracking-tight truncate",
          tone === "income" && "text-income",
          tone === "expense" && "text-expense",
        )}
      >
        {value}
      </p>
    </motion.div>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{desc}</span>
      <kbd className="rounded-lg bg-secondary px-2 py-1 font-mono text-xs font-semibold">{keys}</kbd>
    </div>
  );
}
