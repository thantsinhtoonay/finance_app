import { MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoryById } from "@/lib/budget/categories";
import { formatDay, formatSigned } from "@/lib/budget/format";
import type { Transaction, TxType } from "@/lib/budget/types";
import { cn } from "@/lib/utils";

type Filter = "all" | TxType;

type Props = {
  items: Transaction[];
  filter: Filter;
  search: string;
  onFilter: (filter: Filter) => void;
  onSearch: (search: string) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onAdd: () => void;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expenses" },
];

export function TransactionList({
  items,
  filter,
  search,
  onFilter,
  onSearch,
  onEdit,
  onDelete,
  onAdd,
}: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-label text-muted-foreground uppercase">
              Transactions
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Edit or remove any entry</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                className="h-10 w-40 pl-9 sm:w-56 rounded-xl"
              />
            </div>
            <div className="flex gap-1 rounded-xl bg-secondary p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilter(f.id)}
                  className={cn(
                    "h-10 min-w-16 rounded-lg px-3 text-sm font-semibold transition-all duration-200",
                    filter === f.id
                      ? "bg-primary text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl bg-secondary/30 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {search
                ? "No transactions match your search."
                : filter === "all"
                  ? "No entries this month yet."
                  : filter === "income"
                    ? "No income logged this month."
                    : "No expenses logged this month."}
            </p>
            <Button variant="outline" onClick={onAdd} className="rounded-xl">
              Add entry
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col">
            {items.map((tx, i) => {
              const cat = categoryById(tx.category);
              const title = tx.note || cat.label;
              return (
                <li
                  key={tx.id}
                  onClick={() => onEdit(tx)}
                  className={cn(
                    "group flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl cursor-pointer transition-all duration-150 hover:bg-secondary/50",
                    i > 0 && "border-t border-border/50",
                  )}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${title}`}
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onSelect={() => onEdit(tx)} className="rounded-lg">
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={() => onDelete(tx)} className="rounded-lg">
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
