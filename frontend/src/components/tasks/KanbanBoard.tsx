import { Task, Status } from "@/lib/mock-data";
import { TaskCard } from "./TaskCard";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const columns: { key: Status; label: string; tone: string }[] = [
  { key: "pending", label: "Pending", tone: "bg-slate-500" },
  { key: "in-progress", label: "In Progress", tone: "bg-primary" },
  { key: "completed", label: "Completed", tone: "bg-emerald-500" },
  { key: "overdue", label: "Overdue", tone: "bg-rose-500" },
];

export function KanbanBoard({ initial }: { initial: Task[] }) {
  const [items, setItems] = useState(initial);
  const [hoverCol, setHoverCol] = useState<Status | null>(null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const onDrop = (status: Status) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setItems((arr) => arr.map((t) => (t.id === id ? { ...t, status } : t)));
    setHoverCol(null);
    toast.success(`Moved to ${status}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const cards = items.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => { e.preventDefault(); setHoverCol(col.key); }}
            onDragLeave={() => setHoverCol(null)}
            onDrop={onDrop(col.key)}
            className={cn(
              "rounded-2xl border border-border bg-muted/30 p-3 min-h-[400px] transition",
              hoverCol === col.key && "ring-2 ring-primary/40 bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", col.tone)} />
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="text-xs text-muted-foreground">{cards.length}</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {cards.map((t) => <TaskCard key={t.id} task={t} />)}
              {cards.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
