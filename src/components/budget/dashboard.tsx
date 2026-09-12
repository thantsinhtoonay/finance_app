import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Keyboard,
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
import { CategoryChart } from "@/components/budget/category-chart";
import { CategoryBudgets } from "@/components/budget/category-budgets";
import { SavingsGoal } from "@/components/budget/savings-goal";
import { TransactionDialog } from "@/components/budget/transaction-dialog";
import { TransactionList } from "@/components/budget/transaction-list";
import { YearlyOverview } from "@/components/budget/yearly-overview";
import { QuickAddFab } from "@/components/budget/quick-add-fab";
import { BottomNav } from "@/components/budget/bottom-nav";
import { Settings as SettingsPage } from "@/components/budget/settings";
import { useSettingsStore } from "@/lib/settings/store";
import {
  downloadFile,
  exportToCsv,
  monthTransactions,
  summarizeMonth,
  useBudgetStore,
} from "@/lib/budget/store";
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

type Filter = "all" | TxType;
type View = "dashboard" | "yearly" | "settings";

export function Dashboard() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [view, setView] = useState<View>("dashboard");

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

  const summary = useMemo(
    () => summarizeMonth(transactions, selectedMonth, categoryBudgets),
    [transactions, selectedMonth, categoryBudgets],
  );
  const items = useMemo(
    () => monthTransactions(transactions, selectedMonth, filter, search),
    [transactions, selectedMonth, filter, search],
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

  function handleExportJson() {
    const data: AppData = {
      version: 1,
      transactions,
      monthlyGoal,
      categoryBudgets,
      exportedAt: new Date().toISOString(),
    };
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
          alert("Invalid backup file format.");
          return;
        }
        if (!confirm(`Import ${data.transactions.length} transactions? This will replace current data.`)) {
          return;
        }
        useBudgetStore.setState({
          transactions: data.transactions,
          monthlyGoal: data.monthlyGoal,
          categoryBudgets: data.categoryBudgets,
        });
      } catch {
        alert("Failed to parse backup file.");
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
      } else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      } else if (e.key === "Escape") {
        setDialogOpen(false);
        setPendingDelete(null);
        setShowShortcuts(false);
        setSearch("");
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
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col pb-24 sm:pb-6">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl gradient-purple text-white">
              <Wallet className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Shal Su</h1>
              <p className="text-xs text-muted-foreground">Finance App</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-xl p-1">
              <Button
                variant={view === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("dashboard")}
                className="rounded-lg"
              >
                Monthly
              </Button>
              <Button
                variant={view === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("yearly")}
                className="rounded-lg"
              >
                <CalendarDays className="size-4" />
                Yearly
              </Button>
            </div>

            <Button onClick={openAdd} className="gradient-purple text-white shadow-lg shadow-primary/25">
              <Plus />
              <span className="hidden sm:inline">Add</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setView("settings")}
              aria-label="Settings"
            >
              <SettingsIcon className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-6">
        {view === "settings" ? (
          <div className="py-6">
            <SettingsPage onBack={() => setView("dashboard")} />
          </div>
        ) : view === "yearly" ? (
          <div className="py-6">
            <YearlyOverview year={currentYear} />
          </div>
        ) : (
          <div className="flex flex-col gap-5 py-6">
            <Card className="gradient-card border-0 shadow-card">
              <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
                      Remaining this month
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl",
                        overspent ? "text-expense" : "text-gradient",
                      )}
                    >
                      {formatMoney(summary.remaining)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                      aria-label="Previous month"
                    >
                      <ChevronLeft />
                    </Button>
                    <p className="min-w-24 text-center text-sm font-semibold tabular-nums">
                      <span className="sm:hidden">{formatMonthShort(selectedMonth)}</span>
                      <span className="hidden sm:inline">{formatMonth(selectedMonth)}</span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9"
                      onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                      aria-label="Next month"
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
                    Back to today
                  </Button>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    label="Income"
                    value={formatMoney(summary.income)}
                    icon={<TrendingUp className="size-4 text-emerald-500" />}
                    tone="income"
                  />
                  <StatCard
                    label="Spent"
                    value={formatMoney(summary.expenses)}
                    icon={<Wallet className="size-4 text-red-500" />}
                    tone="expense"
                  />
                  <StatCard
                    label="Goal"
                    value={formatMoney(monthlyGoal)}
                    icon={<TrendingUp className="size-4 text-primary" />}
                    tone={leftover < 0 ? "expense" : leftover > 0 ? "income" : undefined}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
              <CategoryChart categories={summary.byCategory} total={summary.expenses} />
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
              search={search}
              onFilter={setFilter}
              onSearch={setSearch}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onAdd={openAdd}
            />
          </div>
        )}
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
        onSubmit={(draft) => {
          if (editing) updateTransaction(editing.id, draft);
          else addTransaction(draft);
        }}
      />

      <QuickAddFab onAdd={openAdd} />
      <BottomNav active={view} onChange={setView} />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.note || "This transaction"} will be removed from your budget. This cannot be undone.`
                : "This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) deleteTransaction(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keyboard Shortcuts</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 text-sm">
            <ShortcutRow keys="N" desc="Add new transaction" />
            <ShortcutRow keys="/" desc="Focus search" />
            <ShortcutRow keys="?" desc="Toggle this help" />
            <ShortcutRow keys="Esc" desc="Close dialog / clear search" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
    <div className="flex flex-col gap-2 rounded-xl bg-secondary/50 px-4 py-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <p
        className={cn(
          "text-base font-bold tabular-nums tracking-tight sm:text-lg",
          tone === "income" && "text-emerald-600",
          tone === "expense" && "text-red-500",
        )}
      >
        {value}
      </p>
    </div>
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
