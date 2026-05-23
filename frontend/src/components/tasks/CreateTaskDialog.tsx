import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useUsers, createTask } from "@/lib/api";
import { getNextOccurrence } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Paperclip, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(0);
  const { data: users = [] } = useUsers();
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "unassigned",
    dueDate: new Date().toISOString().split('T')[0],
    recurrence: "one-time",
    recurrenceDays: [] as string[],
    carryOver: false
  });
  
  const submit = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    try {
      let finalAssigneeId = form.assigneeId;
      if (finalAssigneeId === "unassigned") finalAssigneeId = "";
      if (finalAssigneeId === "me") finalAssigneeId = me?.id || "";

      let finalDueDate = form.dueDate;
      if (form.recurrence === "weekly") {
        finalDueDate = getNextOccurrence(form.dueDate, form.recurrenceDays);
      }

      await createTask({ ...form, dueDate: finalDueDate, assigneeId: finalAssigneeId, assignedById: me?.id || "" });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
      setStep(0);
      setForm({ title: "", description: "", priority: "medium", assigneeId: "unassigned", dueDate: new Date().toISOString().split('T')[0], recurrence: "one-time", recurrenceDays: [], carryOver: false });
      toast.success("Task created", { description: "Your task was added to the board." });
    } catch (e) {
      toast.error("Failed to create task");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(v) => { 
      onOpenChange(v); 
      if (!v) {
        setStep(0);
        setForm({ title: "", description: "", priority: "medium", assigneeId: "unassigned", dueDate: new Date().toISOString().split('T')[0], recurrence: "one-time", recurrenceDays: [], carryOver: false });
      }
    }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Create new task
          </DialogTitle>
          <DialogDescription>Step {step + 1} of 2 — Set up the perfect task in seconds.</DialogDescription>
        </DialogHeader>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary" animate={{ width: `${((step + 1) / 2) * 100}%` }} />
        </div>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input placeholder="Write a clear, actionable title…" value={form.title} onChange={e => setForm({...form, title: e.target.value})} autoFocus /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={4} placeholder="Add context, links, acceptance criteria…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-1 gap-3">
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
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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

          </motion.div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {step < 1 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={submit}>Create task</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
