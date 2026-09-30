import { Home, Plus, Activity, CircleUserRound, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/store";
import type { TranslationKeys } from "@/lib/i18n/types";

type View = "dashboard" | "history" | "yearly" | "settings";

type Props = {
  active: View;
  onChange: (view: View) => void;
  onAdd: () => void;
};

type NavItem = {
  id: View;
  icon: typeof Home;
  labelKey: keyof TranslationKeys;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: Home, labelKey: "nav_home" },
  { id: "history", icon: History, labelKey: "nav_history" },
  { id: "yearly", icon: Activity, labelKey: "nav_yearly" },
  { id: "settings", icon: CircleUserRound, labelKey: "nav_settings" },
];

export function BottomNav({ active, onChange, onAdd }: Props) {
  const { t } = useTranslation();

  function handleClick(item: NavItem) {
    onChange(item.id);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
      <div className="relative mx-3 mb-3 rounded-2xl border border-border/40 bg-background/95 shadow-2xl shadow-black/25 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85">
        <div className="flex items-center justify-around px-4 py-2">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavButton
              key={item.id}
              item={item}
              label={t(item.labelKey)}
              isActive={active === item.id}
              onClick={() => handleClick(item)}
            />
          ))}

          <button
            onClick={onAdd}
            className="flex items-center justify-center size-12 rounded-full gradient-gold text-white shadow-lg shadow-primary/40 ring-1 ring-white/20 active:scale-90 transition-transform"
            aria-label="Add transaction"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </button>

          {NAV_ITEMS.slice(2).map((item) => (
            <NavButton
              key={item.id}
              item={item}
              label={t(item.labelKey)}
              isActive={active === item.id}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavButton({
  item,
  label,
  isActive,
  onClick,
}: {
  item: NavItem;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center size-11 rounded-xl transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground active:text-foreground",
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <motion.span
          layoutId="navDot"
          className="absolute -bottom-1 size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(184,134,11,0.6)]"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </button>
  );
}
