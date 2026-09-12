import { LayoutDashboard, CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type View = "dashboard" | "yearly" | "settings";

type Props = {
  active: View;
  onChange: (view: View) => void;
};

const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "yearly", label: "Yearly", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden safe-area-pb">
      <div className="glass border-t border-border">
        <div className="flex items-center justify-around px-2 py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-xl transition-colors duration-200 touch-target",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="size-5 relative z-10" />
                <span className="text-[10px] font-semibold relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
