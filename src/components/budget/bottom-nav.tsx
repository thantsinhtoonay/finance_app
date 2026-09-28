import { Home, Search, Plus, Activity, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type View = "dashboard" | "yearly" | "settings";

type Props = {
  active: View;
  onChange: (view: View) => void;
  onAdd: () => void;
  onSearch: () => void;
};

type NavItem = {
  id: View | "search";
  icon: typeof Home;
  action?: "search";
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: Home },
  { id: "search", icon: Search, action: "search" },
  { id: "yearly", icon: Activity },
  { id: "settings", icon: CircleUserRound },
];

export function BottomNav({ active, onChange, onAdd, onSearch }: Props) {
  function handleClick(item: NavItem) {
    if (item.action === "search") {
      onSearch();
      return;
    }
    onChange(item.id as View);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div className="mx-3 mb-3 rounded-2xl border border-border/30 bg-background/90 shadow-2xl shadow-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-center justify-around px-4 py-2">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={active === item.id}
              onClick={() => handleClick(item)}
            />
          ))}

          <button
            onClick={onAdd}
            className="flex items-center justify-center size-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 active:scale-90 transition-transform"
            aria-label="Add transaction"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </button>

          {NAV_ITEMS.slice(2).map((item) => (
            <NavButton
              key={item.id}
              item={item}
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
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center size-11 rounded-xl transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground active:text-foreground",
      )}
      aria-label={item.id}
    >
      <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <motion.span
          layoutId="navDot"
          className="absolute -bottom-1 size-1.5 rounded-full bg-foreground"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </button>
  );
}
