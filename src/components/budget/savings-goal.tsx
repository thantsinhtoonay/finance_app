import { useState } from "react";
import { Check, Pencil, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { clampPercent, formatMoney, parseAmount } from "@/lib/budget/format";
import { cn } from "@/lib/utils";

type Props = {
  goal: number;
  remaining: number;
  onChangeGoal: (goal: number) => void;
};

export function SavingsGoal({ goal, remaining, onChangeGoal }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(goal));

  const towardGoal = Math.max(0, remaining);
  const pct = goal > 0 ? clampPercent((towardGoal / goal) * 100) : 0;
  const met = remaining >= goal && goal > 0;
  const shortfall = Math.max(0, goal - remaining);
  const surplus = Math.max(0, remaining - goal);

  function commit() {
    const next = parseAmount(draft);
    if (next !== null) onChangeGoal(next);
    else setDraft(String(goal));
    setEditing(false);
  }

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <Target className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
                Savings goal
              </p>
            </div>
          </div>
          {!editing ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => {
                setDraft(String(goal));
                setEditing(true);
              }}
              aria-label="Edit savings goal"
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
        </div>

        {editing ? (
          <form
            className="flex items-center gap-2"
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
              aria-label="Monthly savings goal"
              className="text-lg font-bold tabular-nums"
            />
            <Button type="submit" size="icon" className="gradient-purple text-white" aria-label="Save goal">
              <Check />
            </Button>
          </form>
        ) : (
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {formatMoney(goal)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">/ month</span>
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <span className="text-sm font-semibold tabular-nums">{pct.toFixed(0)}%</span>
          </div>
          <Progress
            value={pct}
            indicatorClassName={met ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : undefined}
            aria-label={`${pct.toFixed(0)} percent of savings goal`}
          />
          <p
            className={cn(
              "text-sm font-medium",
              met ? "text-emerald-600" : remaining < 0 ? "text-red-500" : "text-muted-foreground",
            )}
          >
            {goal <= 0
              ? "Set a monthly target to track savings."
              : met
                ? `Goal met · ${formatMoney(surplus)} extra`
                : remaining < 0
                  ? "Overspent — nothing left to save this month."
                  : `${formatMoney(shortfall)} short of the goal`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
