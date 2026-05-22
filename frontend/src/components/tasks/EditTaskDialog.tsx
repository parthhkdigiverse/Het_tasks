import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useUsers, updateTask } from "@/lib/api";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Task } from "@/lib/mock-data";

export function EditTaskDialog({ task, open, onOpenChange }: { task: Task | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: users = [] } = useUsers();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "unassigned"
  });

  useEffect(() => {
    if (task && open) {
      setForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        assigneeId: task.assignee?.id || "unassigned"
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

      await updateTask(task.id, { ...form, assigneeId: finalAssigneeId });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
      toast.success("Task updated");
    } catch (e) {
      toast.error("Failed to update task");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" /> Edit task
          </DialogTitle>
          <DialogDescription>Update the details of your task.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="Task title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={4} placeholder="Description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
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
              <Label>Assigned To</Label>
              <Select value={form.assigneeId} onValueChange={v => setForm({...form, assigneeId: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
