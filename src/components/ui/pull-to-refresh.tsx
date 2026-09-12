import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

type Props = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export function PullToRefresh({ onRefresh, children, className }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, 100], [0, 1]);
  const iconRotation = useTransform(y, [0, 100], [0, 360]);
  const iconScale = useTransform(y, [0, 50, 100], [0.5, 1, 1.2]);
  const threshold = 80;

  const handleDragEnd = useCallback(async () => {
    const currentY = y.get();
    if (currentY >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      animate(y, 60, { type: "spring", stiffness: 300, damping: 30 });
      try {
        await onRefresh();
      } finally {
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
        setIsRefreshing(false);
      }
    } else {
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }, [y, isRefreshing, onRefresh]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center py-4"
        style={{ opacity: pullProgress }}
      >
        <motion.div
          style={{ rotate: iconRotation, scale: iconScale }}
          className="text-primary"
        >
          <RefreshCw className={cn("size-5", isRefreshing && "animate-spin")} />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragEnd={handleDragEnd}
        className="min-h-[50vh]"
      >
        {children}
      </motion.div>
    </div>
  );
}
