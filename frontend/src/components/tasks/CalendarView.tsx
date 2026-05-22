import { Task } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const [cursor, setCursor] = useState(new Date());
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{format(cursor, "MMMM yyyy")}</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, -1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-muted-foreground mb-1">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d} className="px-2 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const dayTasks = tasks.filter((t) => {
            const tDate = t.dueDate === "Tomorrow" ? new Date(Date.now() + 86400000) : new Date(t.dueDate);
            return isSameDay(tDate, d);
          });
          const muted = !isSameMonth(d, cursor);
          const today = isSameDay(d, new Date());
          return (
            <div key={d.toISOString()} className={cn("min-h-[92px] rounded-lg border p-2 text-xs", muted ? "bg-muted/20 text-muted-foreground" : "bg-background", today && "ring-2 ring-primary/40")}>
              <div className="flex items-center justify-between">
                <span className={cn("font-medium", today && "text-primary")}>{format(d, "d")}</span>
                {dayTasks.length > 0 && <span className="text-[10px] text-muted-foreground">{dayTasks.length}</span>}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 2).map((t) => (
                  <div key={t.id} className="truncate rounded px-1.5 py-0.5 bg-primary/10 text-primary text-[10px]">{t.title}</div>
                ))}
                {dayTasks.length > 2 && <div className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 2} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
