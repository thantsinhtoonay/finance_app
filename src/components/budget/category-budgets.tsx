import { useState } from "react";
import { Check, Pencil, AlertTriangle, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBudgetStore } from "@/lib/budget/store";
import type { CategoryBudget, CategoryTotal } from "@/lib/budget/types";
import { formatMoney, parseAmount, clampPercent } from "@/lib/budget/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/store";

type Props = {
  categories: CategoryTotal[];
  categoryBudgets: CategoryBudget[];
};

export function CategoryBudgets({ categories, categoryBudgets }: Props) {
  const setCategoryBudget = useBudgetStore((s) => s.setCategoryBudget);
  const { t } = useTranslation();

  const expenseCategories = categories.filter((c) => c.amount > 0);

  if (expenseCategories.length === 0) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <Layers className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
              {t("budget_limit")}
            </p>
            <p className="text-xs text-muted-foreground">{t("budget_remaining")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {expenseCategories.map((cat) => {
            const budget = categoryBudgets.find((b) => b.categoryId === cat.id);
            return (
              <CategoryBudgetRow
                key={cat.id}
                category={cat}
                budget={budget}
                onSetBudget={setCategoryBudget}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBudgetRow({
  category,
  budget,
  onSetBudget,
}: {
  category: CategoryTotal;
  budget: CategoryBudget | undefined;
  onSetBudget: (categoryId: string, limit: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget?.limit ?? ""));
  const { t } = useTranslation();

  const limit = budget?.limit ?? 0;
  const pct = limit > 0 ? clampPercent((category.amount / limit) * 100) : 0;
  const overBudget = limit > 0 && category.amount > limit;
  const nearLimit = limit > 0 && category.amount > limit * 0.8 && !overBudget;

  function commit() {
    const next = parseAmount(draft);
    if (next !== null && next > 0) onSetBudget(category.id, next);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm font-semibold">{category.label}</span>
          {overBudget && (
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
              <AlertTriangle className="size-3" />
              {t("budget_exceeded")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {editing ? (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                commit();
              }}
            >
              <Input
                autoFocus
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                className="h-7 w-24 text-xs font-semibold tabular-nums"
              />
              <Button type="submit" size="icon" className="size-7 gradient-purple text-white">
                <Check className="size-3" />
              </Button>
            </form>
          ) : (
            <>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                {formatMoney(category.amount)}
                {limit > 0 && (
                  <span className="text-muted-foreground/60"> / {formatMoney(limit)}</span>
                )}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => {
                  setDraft(String(limit || ""));
                  setEditing(true);
                }}
              >
                <Pencil className="size-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      {limit > 0 && (
        <Progress
          value={pct}
          indicatorClassName={overBudget ? "bg-gradient-to-r from-red-400 to-red-500" : nearLimit ? "bg-gradient-to-r from-amber-400 to-amber-500" : undefined}
          aria-label={`${category.label} budget ${pct.toFixed(0)}%`}
        />
      )}
    </div>
  );
}
