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
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

type Props = {
  year: string;
};

export function YearlyOverview({ year }: Props) {
  const transactions = useBudgetStore((s) => s.transactions);
  const categoryBudgets = useBudgetStore((s) => s.categoryBudgets);

  const summary = useMemo(
    () => summarizeYear(transactions, year, categoryBudgets),
    [transactions, year, categoryBudgets],
  );

  return (
    <div className="flex flex-col gap-5">
      <Card className="gradient-card border-0">
        <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
              {year} Summary
            </p>
            <p className="text-sm text-muted-foreground">Annual financial overview</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4">
              <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-100">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600/70">Total Income</p>
                <p className="text-lg font-bold tabular-nums tracking-tight text-emerald-600">
                  {formatMoney(summary.totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-4">
              <div className="flex items-center justify-center size-10 rounded-xl bg-red-100">
                <TrendingDown className="size-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-500/70">Total Expenses</p>
                <p className="text-lg font-bold tabular-nums tracking-tight text-red-500">
                  {formatMoney(summary.totalExpenses)}
                </p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-4",
              summary.netSavings >= 0 ? "bg-primary/5" : "bg-red-50",
            )}>
              <div className={cn(
                "flex items-center justify-center size-10 rounded-xl",
                summary.netSavings >= 0 ? "bg-primary/10" : "bg-red-100",
              )}>
                <Wallet className={cn("size-5", summary.netSavings >= 0 ? "text-primary" : "text-red-500")} />
              </div>
              <div>
                <p className={cn("text-xs font-semibold", summary.netSavings >= 0 ? "text-primary/70" : "text-red-500/70")}>Net Savings</p>
                <p className={cn(
                  "text-lg font-bold tabular-nums tracking-tight",
                  summary.netSavings >= 0 ? "text-primary" : "text-red-500",
                )}>
                  {formatMoney(summary.netSavings)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
              Monthly Breakdown
            </p>
            <p className="text-sm text-muted-foreground">Income vs expenses by month</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyBreakdown} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-lg border border-border">
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
                  name="Income"
                  fill="var(--color-income)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="var(--color-expense)"
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
          <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
                Top Spending Categories
              </p>
              <p className="text-sm text-muted-foreground">Where your money went this year</p>
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
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{cat.label}</span>
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
