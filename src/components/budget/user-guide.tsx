import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  UserPlus,
  PlusCircle,
  Wallet,
  Target,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";
import type { TranslationKeys } from "@/lib/i18n/types";

const STEPS = [
  { icon: UserPlus, title: "guide_step1_title", desc: "guide_step1_desc" },
  { icon: PlusCircle, title: "guide_step2_title", desc: "guide_step2_desc" },
  { icon: Wallet, title: "guide_step3_title", desc: "guide_step3_desc" },
  { icon: Target, title: "guide_step4_title", desc: "guide_step4_desc" },
  { icon: CalendarDays, title: "guide_step5_title", desc: "guide_step5_desc" },
  { icon: SlidersHorizontal, title: "guide_step6_title", desc: "guide_step6_desc" },
] as const satisfies readonly {
  icon: typeof BookOpen;
  title: keyof TranslationKeys;
  desc: keyof TranslationKeys;
}[];

type Props = {
  className?: string;
  defaultOpen?: boolean;
};

export function UserGuide({ className, defaultOpen = false }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/50"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{t("guide_title")}</p>
            <p className="text-xs text-muted-foreground">{t("guide_subtitle")}</p>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              open && "rotate-180 text-primary",
            )}
          />
        </button>

        {open && (
          <ol className="flex flex-col gap-4 border-t border-border/50 px-5 py-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="size-3.5 shrink-0 text-primary" />
                      {t(step.title)}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t(step.desc)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
