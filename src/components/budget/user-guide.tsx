import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function UserGuide({ className }: Props) {
  const { t } = useTranslation();

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <Link
          to="/user-guide"
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/50"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{t("guide_title")}</p>
            <p className="text-xs text-muted-foreground">{t("guide_subtitle")}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  );
}
