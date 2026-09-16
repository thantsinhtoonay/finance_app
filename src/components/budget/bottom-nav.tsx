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
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div className="mx-3 mb-3 rounded-2xl border border-border/30 bg-background/90 shadow-2xl shadow-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-6 py-2.5 rounded-xl transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="relative z-10"
                >
                  <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <motion.span
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 0 }}
                  className="text-[11px] font-semibold relative z-10"
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
