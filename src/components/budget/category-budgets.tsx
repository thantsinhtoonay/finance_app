import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Pencil, AlertTriangle, Layers, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBudgetStore } from "@/lib/budget/store";
import { categoryById, translatedCategoryLabel } from "@/lib/budget/categories";
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
  const removeCategoryBudget = useBudgetStore((s) => s.removeCategoryBudget);
  const { t } = useTranslation();

  // Show every category that has spending this month OR an active budget,
  // so budgets can be planned before any spending happens.
  const rows = useMemo(() => {
    const map = new Map<string, CategoryTotal>();
    for (const c of categories) {
      if (c.amount > 0) map.set(c.id, c);
    }
    for (const b of categoryBudgets) {
      if (!map.has(b.categoryId)) {
        const cat = categoryById(b.categoryId);
        map.set(b.categoryId, {
          id: b.categoryId,
          label: cat.label,
          amount: 0,
          percent: 0,
          color: cat.color,
        });
      }
    }
    return [...map.values()];
  }, [categories, categoryBudgets]);

  if (rows.length === 0) return null;

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
            <p className="text-xs text-muted-foreground">{t("budget_spent")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((cat) => {
            const budget = categoryBudgets.find((b) => b.categoryId === cat.id);
            return (
              <CategoryBudgetRow
                key={cat.id}
                category={cat}
                budget={budget}
                onSetBudget={setCategoryBudget}
                onRemoveBudget={removeCategoryBudget}
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
  onRemoveBudget,
}: {
  category: CategoryTotal;
  budget: CategoryBudget | undefined;
  onSetBudget: (categoryId: string, limit: number) => void;
  onRemoveBudget: (categoryId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget?.limit ?? ""));
  const committedRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!editing) setDraft(String(budget?.limit ?? ""));
  }, [budget?.limit, editing]);

  const limit = budget?.limit ?? 0;
  const pct = limit > 0 ? clampPercent((category.amount / limit) * 100) : 0;
  const overBudget = limit > 0 && category.amount > limit;
  const nearLimit = limit > 0 && category.amount > limit * 0.8 && !overBudget;

  function commit() {
    if (committedRef.current) return;
    committedRef.current = true;
    const trimmed = draft.trim();
    if (trimmed === "") {
      if (limit > 0) onRemoveBudget(category.id);
    } else {
      const next = parseAmount(trimmed);
      if (next !== null && next > 0) onSetBudget(category.id, next);
      else setDraft(String(budget?.limit ?? ""));
    }
    setEditing(false);
    setTimeout(() => { committedRef.current = false; }, 300);
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="truncate text-sm font-semibold">{translatedCategoryLabel(category.id, t)}</span>
          {overBudget && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
              <AlertTriangle className="size-3" />
              {t("budget_exceeded")}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {editing ? (
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                commit();
              }}
            >
              <Input
                autoFocus
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9,]/g, ""))}
                onBlur={commit}
                className="h-9 w-24 text-xs font-semibold tabular-nums"
              />
              <Button type="submit" size="icon" className="size-9 gradient-gold text-white">
                <Check className="size-4" />
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
                className="size-9"
                onClick={() => {
                  setDraft(String(limit || ""));
                  setEditing(true);
                }}
                aria-label={t("budget_set")}
                title={t("budget_set")}
              >
                <Pencil className="size-3.5" />
              </Button>
              {limit > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={() => onRemoveBudget(category.id)}
                  aria-label={t("budget_remove")}
                  title={t("budget_remove")}
                >
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-red-500" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      {limit > 0 && (
        <Progress
          value={pct}
          indicatorClassName={overBudget ? "bg-gradient-to-r from-red-400 to-red-500" : nearLimit ? "bg-gradient-to-r from-amber-400 to-amber-500" : undefined}
          aria-label={`${translatedCategoryLabel(category.id, t)} budget ${pct.toFixed(0)}%`}
        />
      )}
    </div>
  );
}
