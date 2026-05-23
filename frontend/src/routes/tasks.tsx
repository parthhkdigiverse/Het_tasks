import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTasks, useUsers } from "@/lib/api";
import { Priority, Recurrence } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal, LayoutGrid, List, CalendarDays } from "lucide-react";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListTable } from "@/components/tasks/TaskListTable";
import { CalendarView } from "@/components/tasks/CalendarView";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { isToday } from "date-fns";
import { isTaskActiveOnDate } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

const quickFilters = ["All", "Today", "Upcoming", "Due", "Completed"];

function TasksPage() {
  const { user: me } = useAuth();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks(me?.id);
  const { data: users = [], isLoading: usersLoading } = useUsers();
  
  const [q, setQ] = useState("");
  const [quick, setQuick] = useState("All");
  const [priority, setPriority] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return allTasks.filter((t: any) => {
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (type !== "all" && t.recurrence !== type) return false;
      
      const tDate = t.dueDate === "Tomorrow" ? new Date(Date.now() + 86400000) : new Date(t.dueDate);
      
      if (quick === "Today" && !isTaskActiveOnDate(t, new Date())) return false;
      if (quick === "Upcoming" && tDate <= new Date()) return false;
      if (quick === "Due" && (tDate > new Date() || t.status === "completed")) return false;
      if (quick === "Completed" && t.status !== "completed") return false;
      return true;
    });
  }, [allTasks, q, priority, type, quick]);

  if (tasksLoading || usersLoading) return <div className="p-8 text-center">Loading tasks...</div>;

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} tasks · drag cards across columns</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" />New task</Button>
      </header>

      <div className="rounded-2xl border border-border bg-card p-3 md:p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[130px]"><SlidersHorizontal className="h-3.5 w-3.5 mr-1" /><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priority</SelectItem>
                {(["low","medium","high","urgent"] as Priority[]).map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(["one-time","daily","weekly","monthly","custom"] as Recurrence[]).map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickFilters.map((f) => (
            <button key={f} onClick={() => setQuick(f)} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${quick === f ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>
              {f}
            </button>
          ))}
          <Badge variant="secondary" className="ml-auto">{filtered.length} results</Badge>
        </div>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" />Board</TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5"><List className="h-3.5 w-3.5" />List</TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="board"><KanbanBoard initial={filtered} /></TabsContent>
        <TabsContent value="list"><TaskListTable tasks={filtered} /></TabsContent>
        <TabsContent value="calendar"><CalendarView tasks={filtered} /></TabsContent>
      </Tabs>

      <CreateTaskDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
