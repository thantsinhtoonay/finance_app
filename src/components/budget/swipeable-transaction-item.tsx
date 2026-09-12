import { useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryById } from "@/lib/budget/categories";
import { formatDay, formatSigned } from "@/lib/budget/format";
import type { Transaction } from "@/lib/budget/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/store";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

type Props = {
  tx: Transaction;
  index: number;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
};

export function SwipeableTransactionItem({ tx, index, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const x = useMotionValue(0);
  const actionsWidth = 140;

  const actionOpacity = useTransform(x, [-actionsWidth, -actionsWidth / 2, 0], [1, 0.8, 0]);
  const actionX = useTransform(x, [-actionsWidth, 0], [0, actionsWidth]);

  const cat = categoryById(tx.category);
  const title = tx.note || cat.label;

  function handleDragEnd(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const threshold = -50;
    if (info.offset.x < threshold) {
      setShowActions(true);
    } else {
      setShowActions(false);
    }
  }

  return (
    <div className="relative overflow-hidden -mx-3">
      {/* Action buttons revealed on swipe */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3"
        style={{ opacity: actionOpacity, x: actionX }}
      >
        <button
          onClick={() => onEdit(tx)}
          className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary touch-target"
        >
          <Pencil className="size-4" />
        </button>
        <button
          onClick={() => onDelete(tx)}
          className="flex items-center justify-center size-10 rounded-xl bg-destructive/10 text-destructive touch-target"
        >
          <Trash2 className="size-4" />
        </button>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative flex items-center gap-3 py-3 px-3 rounded-xl touch-target"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div
          className="flex items-center justify-center size-10 rounded-xl shrink-0"
          style={{ backgroundColor: `${cat.color}20` }}
        >
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: cat.color }}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{formatDay(tx.date)}</span>
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {cat.label}
            </Badge>
            {tx.recurring && (
              <Badge variant="primary" className="text-[10px] px-1.5 py-0 capitalize">
                {tx.recurring}
              </Badge>
            )}
          </p>
        </div>
        <p
          className={cn(
            "shrink-0 text-right text-sm font-semibold whitespace-nowrap tabular-nums",
            tx.type === "income" ? "text-emerald-600" : "text-foreground",
          )}
        >
          {formatSigned(tx.amount, tx.type)}
        </p>
      </motion.div>
    </div>
  );
}
