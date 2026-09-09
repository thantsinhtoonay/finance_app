import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/budget/format";
import type { CategoryTotal } from "@/lib/budget/types";

type Props = {
  categories: CategoryTotal[];
  total: number;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryTotal }>;
}) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl bg-white px-3 py-2 text-sm shadow-lg border border-border">
      <p className="font-semibold">{item.label}</p>
      <p className="tabular-nums text-muted-foreground">
        {formatMoney(item.amount)} · {item.percent.toFixed(0)}%
      </p>
    </div>
  );
}

export function CategoryChart({ categories, total }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-5">
        <div>
          <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
            Spending by category
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Where this month went</p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-1 min-h-48 items-center justify-center rounded-xl bg-secondary/50 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              No expenses this month. Add a purchase to see the breakdown.
            </p>
          </div>
        ) : (
          <div className="grid flex-1 items-center gap-5 md:grid-cols-[auto_1fr]">
            <div className="relative mx-auto size-48 shrink-0 sm:size-52">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="label"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={4}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {categories.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="size-full rounded-full bg-secondary" />
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold tracking-label text-muted-foreground uppercase">Spent</span>
                <span className="text-lg font-bold tabular-nums tracking-tight">
                  {formatMoney(total)}
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-2.5">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{cat.label}</span>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {cat.percent.toFixed(0)}%
                  </span>
                  <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
                    {formatMoney(cat.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
