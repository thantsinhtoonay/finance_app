import { Plus } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  onAdd: () => void;
};

export function QuickAddFab({ onAdd }: Props) {
  return (
    <motion.button
      onClick={onAdd}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="fixed bottom-24 right-4 size-14 rounded-full gradient-gold text-white shadow-xl shadow-primary/30 sm:hidden z-50 flex items-center justify-center touch-target ring-1 ring-white/20"
      aria-label="Add transaction"
    >
      <Plus className="size-6" />
    </motion.button>
  );
}
