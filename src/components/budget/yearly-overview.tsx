import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { summarizeYear, useBudgetStore } from "@/lib/budget/store";
import { formatMoney } from "@/lib/budget/format";
import { translatedCategoryLabel } from "@/lib/budget/categories";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useTranslation } from "@/lib/i18n/store";

type Props = {
  year: string;
};

export function YearlyOverview({ year }: Props) {
  const transactions = useBudgetStore((s) => s.transactions);
  const categoryBudgets = useBudgetStore((s) => s.categoryBudgets);
  const { t, language } = useTranslation();

  const summary = useMemo(
    () => summarizeYear(transactions, year, categoryBudgets),
    [transactions, year, categoryBudgets, language],
  );

  return (
    <div className="flex flex-col gap-5">
      <Card className="gradient-card border-0">
        <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
          <div>
            <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
              {year} {t("yearly_summary")}
            </p>
            <p className="text-sm text-muted-foreground">{t("yearly_desc")}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-income/10 px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center justify-center size-10 rounded-xl bg-income/15 shrink-0">
                <TrendingUp className="size-5 text-income" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-income/80">{t("yearly_total_income")}</p>
                <p className="text-base sm:text-lg font-bold tabular-nums tracking-tight text-income truncate">
                  {formatMoney(summary.totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-expense/10 px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center justify-center size-10 rounded-xl bg-expense/15 shrink-0">
                <TrendingDown className="size-5 text-expense" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-expense/80">{t("yearly_total_expenses")}</p>
                <p className="text-base sm:text-lg font-bold tabular-nums tracking-tight text-expense truncate">
                  {formatMoney(summary.totalExpenses)}
                </p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 sm:px-4 sm:py-4",
              summary.netSavings >= 0 ? "bg-primary/10" : "bg-expense/10",
            )}>
              <div className={cn(
                "flex items-center justify-center size-10 rounded-xl shrink-0",
                summary.netSavings >= 0 ? "bg-primary/15" : "bg-expense/15",
              )}>
                <Wallet className={cn("size-5", summary.netSavings >= 0 ? "text-primary" : "text-expense")} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xs font-semibold", summary.netSavings >= 0 ? "text-primary/80" : "text-expense/80")}>
                  {t("yearly_net_savings")}
                </p>
                <p className={cn(
                  "text-base sm:text-lg font-bold tabular-nums tracking-tight truncate",
                  summary.netSavings >= 0 ? "text-primary" : "text-expense",
                )}>
                  {formatMoney(summary.netSavings)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
          <div>
            <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
              {t("yearly_breakdown")}
            </p>
            <p className="text-sm text-muted-foreground">{t("yearly_breakdown_desc")}</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyBreakdown} barGap={4}>
                <defs>
                  <linearGradient id="yearIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-income)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="yearExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-expense)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--color-expense)" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={8}
                />
                <YAxis
                  width={44}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-secondary)", opacity: 0.5 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl glass-card px-4 py-3 text-sm shadow-lg border border-border/50">
                        <p className="font-bold mb-1">{label}</p>
                        {payload.map((entry) => (
                          <p key={entry.name} className="tabular-nums text-muted-foreground font-medium">
                            {entry.name}: {formatMoney(entry.value as number)}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-muted-foreground">{value}</span>
                  )}
                />
                <Bar
                  dataKey="income"
                  name={t("dashboard_income")}
                  fill="url(#yearIncomeGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expenses"
                  name={t("dashboard_expenses")}
                  fill="url(#yearExpenseGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {summary.topCategories.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
            <div>
              <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
                {t("yearly_top_categories")}
              </p>
              <p className="text-sm text-muted-foreground">{t("yearly_top_desc")}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {summary.topCategories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center size-10 rounded-xl shrink-0"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}66` }}
                    />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{translatedCategoryLabel(cat.id, t)}</span>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {cat.percent.toFixed(0)}%
                  </span>
                  <span className="shrink-0 text-right text-sm font-bold tabular-nums">
                    {formatMoney(cat.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
