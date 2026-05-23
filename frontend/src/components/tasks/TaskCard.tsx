import { motion } from "framer-motion";
import { Task } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Bell, Calendar, MoreHorizontal, Repeat, CheckCircle2 } from "lucide-react";
import { initials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/lib/api";
import { EditTaskDialog } from "./EditTaskDialog";

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  urgent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export function TaskCard({ task, draggable = true }: { task: Task; draggable?: boolean }) {
  const [editOpen, setEditOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    } catch (e) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <>
    <TooltipProvider delayDuration={200}>
      <motion.div
        layout
        whileHover={{ y: -2 }}
        draggable={draggable}
        onDragStart={(e: any) => e.dataTransfer?.setData("text/plain", task.id)}
        className="group rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] capitalize border", priorityStyles[task.priority])}>
              {task.priority}
            </Badge>
            {task.recurrence !== "one-time" && (
              <Badge variant="outline" className="text-[10px] capitalize gap-1">
                <Repeat className="h-2.5 w-2.5" />{task.recurrence}
              </Badge>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-accent rounded transition shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h4 className="mt-2 text-sm font-semibold leading-snug">{task.title}</h4>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>



        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />{task.dueDate && task.dueDate !== "Tomorrow" ? format(new Date(task.dueDate), "MMM d") : "Tomorrow"}
            {task.reminder && <Bell className="h-3.5 w-3.5 text-primary" />}
          </div>

        </div>
      </motion.div>
    </TooltipProvider>
    <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
