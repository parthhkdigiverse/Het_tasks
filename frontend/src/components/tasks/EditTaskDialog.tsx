import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useUsers, updateTask } from "@/lib/api";
import { getNextOccurrence } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Task } from "@/lib/mock-data";

export function EditTaskDialog({ task, open, onOpenChange }: { task: Task | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: users = [] } = useUsers();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "unassigned",
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    recurrence: "one-time",
    recurrenceDays: [] as string[],
    carryOver: false
  });

  useEffect(() => {
    if (task && open) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        assigneeId: task.assignee?.id || "unassigned",
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        recurrence: task.recurrence || "one-time",
        recurrenceDays: task.recurrenceDays || [],
        carryOver: task.carryOver || false
      });
    }
  }, [task, open]);
  
  const submit = async () => {
    if (!task) return;
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    try {
      let finalAssigneeId = form.assigneeId;
      if (finalAssigneeId === "unassigned") finalAssigneeId = "";

      let finalDueDate = form.dueDate;
      if (form.recurrence === "weekly") {
        finalDueDate = getNextOccurrence(form.dueDate, form.recurrenceDays);
      }

      await updateTask(task.id, { ...form, dueDate: finalDueDate, assigneeId: finalAssigneeId });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
      toast.success("Task updated");
    } catch (e) {
      toast.error("Failed to update task");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" /> Edit task
          </DialogTitle>
          <DialogDescription>Update the details of your task.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="Task title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} placeholder="Description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={form.assigneeId} onValueChange={v => setForm({...form, assigneeId: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
            <div className="space-y-2"><Label>Due date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-9" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2"><Label>Time</Label><Input type="time" defaultValue="09:00" /></div>
          </div>
          <div className="space-y-2">
            <Label>Recurrence</Label>
            <Tabs value={form.recurrence} onValueChange={(v) => setForm({...form, recurrence: v})}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="one-time">One-time</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly" className="pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => {
                    const isSelected = form.recurrenceDays.includes(d);
                    return (
                      <button 
                        type="button"
                        key={d} 
                        onClick={() => {
                          if (isSelected) {
                            setForm({...form, recurrenceDays: form.recurrenceDays.filter(day => day !== d)});
                          } else {
                            setForm({...form, recurrenceDays: [...form.recurrenceDays, d]});
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md border text-xs transition-all font-medium ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                            : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="custom" className="pt-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Select pop-up date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-9" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            {['weekly', 'monthly', 'custom'].includes(form.recurrence) && (
              <div className="flex items-center justify-between rounded-lg border p-3 mt-4">
                <div>
                  <p className="text-sm font-medium">Carry over</p>
                  <p className="text-xs text-muted-foreground">Carry over to next day if incomplete</p>
                </div>
                <Switch checked={form.carryOver} onCheckedChange={(c) => setForm({...form, carryOver: c})} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
