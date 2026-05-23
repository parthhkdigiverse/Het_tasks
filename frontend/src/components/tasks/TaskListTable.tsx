import { Task, initials } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn, getLocalMidnightDate } from "@/lib/utils";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteTask } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { EditTaskDialog } from "./EditTaskDialog";

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

function TaskRow({ t }: { t: Task }) {
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteTask(t.id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    } catch (e) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <>
      <TableRow className="group">
        <TableCell>
          <p className="font-medium text-sm">{t.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
        </TableCell>

        <TableCell><Badge variant="outline" className={cn("capitalize", priorityStyles[t.priority])}>{t.priority}</Badge></TableCell>
        <TableCell><Badge variant="outline" className={cn("capitalize border-0", statusStyles[t.status])}>{t.status}</Badge></TableCell>
        <TableCell className="text-sm text-muted-foreground">{t.dueDate && t.dueDate !== "Tomorrow" ? format(getLocalMidnightDate(t.dueDate), "MMM d") : "Tomorrow"}</TableCell>
        <TableCell><Badge variant="secondary" className="capitalize">{t.recurrence || "one-time"}</Badge></TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-accent rounded transition">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <EditTaskDialog task={t} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
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

              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => <TaskRow key={t.id} t={t} />)}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
