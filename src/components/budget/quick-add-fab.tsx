import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onAdd: () => void;
};

export function QuickAddFab({ onAdd }: Props) {
  return (
    <Button
      onClick={onAdd}
      className="fixed bottom-24 right-4 size-14 rounded-2xl gradient-purple text-white shadow-xl shadow-primary/30 sm:hidden z-50 active:scale-95 transition-transform"
      size="icon"
      aria-label="Add transaction"
    >
      <Plus className="size-6" />
    </Button>
  );
}
