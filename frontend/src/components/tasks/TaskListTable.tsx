import { Task, initials } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};
const statusStyles: Record<string, string> = {
  pending: "bg-slate-500/10 text-slate-600",
  "in-progress": "bg-primary/10 text-primary",
  completed: "bg-emerald-500/10 text-emerald-600",
  overdue: "bg-rose-500/10 text-rose-600",
  cancelled: "bg-muted text-muted-foreground",
};

export function TaskListTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id} className="group">
                <TableCell>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-medium text-muted-foreground w-6">To:</span>
                      <Avatar className="h-5 w-5"><AvatarImage src={t.assignee?.avatar || ""} /><AvatarFallback className="text-[8px]">{initials(t.assignee?.name || "U")}</AvatarFallback></Avatar>
                      <span className="text-sm hidden md:inline">{t.assignee?.name || "Unassigned"}</span>
                    </div>
                    {t.assignedBy && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-medium text-muted-foreground w-6">By:</span>
                        <Avatar className="h-5 w-5"><AvatarImage src={t.assignedBy.avatar || ""} /><AvatarFallback className="text-[8px]">{initials(t.assignedBy.name || "S")}</AvatarFallback></Avatar>
                        <span className="text-xs text-muted-foreground hidden md:inline">{t.assignedBy.name}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className={cn("capitalize", priorityStyles[t.priority])}>{t.priority}</Badge></TableCell>
                <TableCell><Badge variant="outline" className={cn("capitalize border-0", statusStyles[t.status])}>{t.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.dueDate && t.dueDate !== "Tomorrow" ? format(new Date(t.dueDate), "MMM d") : "Tomorrow"}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{t.recurrence || "one-time"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
