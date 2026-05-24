import { createFileRoute } from "@tanstack/react-router";
import { initials } from "@/lib/mock-data";
import { useUsers, deleteUser, updateUser, createUser, useTasks } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Mail, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/users")({ component: UsersPage });

function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useUsers();
  const { data: allTasks = [] } = useTasks();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [open, setOpen] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", password: "" });
  const [addForm, setAddForm] = useState({ name: "", email: "", role: "Member", password: "" });
  
  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  const roles = Array.from(new Set(users.map((u: any) => u.role)));
  const filtered = users.filter((u: any) =>
    (q ? (u.name + u.email).toLowerCase().includes(q.toLowerCase()) : true) &&
    (role === "all" || u.role === role)
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} team members</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" />Add user</Button>
      </header>

      <div className="rounded-2xl border bg-card p-3 md:p-4 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="pl-9" />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full md:w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filtered.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl border bg-card p-5 hover:shadow-md hover:border-primary/30 transition">
            <div className="flex items-start justify-between">
              <div className="relative">
                <Avatar className="h-14 w-14"><AvatarImage src={u.avatar} /><AvatarFallback>{initials(u.name)}</AvatarFallback></Avatar>
              </div>

            </div>
            <div className="mt-3">
              <h3 className="font-semibold leading-tight">{u.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{u.role}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5"><Mail className="h-3 w-3" />{u.email}</p>
            </div>
            <div className="mt-4 text-center">
              <div className="rounded-lg bg-muted/50 p-2">
                <p className="text-lg font-semibold">{allTasks.filter((t: any) => t.assignee?.id === u.id).length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => {
                setViewUser(u);
                setEditForm({ name: u.name, email: u.email, role: u.role, password: u.password || "" });
              }}>Edit</Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add User Dialog */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setAddForm({ name: "", email: "", role: "Member", password: "" });
      }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add user</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Full name</Label><Input placeholder="Jane Doe" value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="jane@company.com" value={addForm.email} onChange={(e) => setAddForm({...addForm, email: e.target.value})} /></div>
            <div className="space-y-2"><Label>Role</Label>
              <Select value={addForm.role} onValueChange={(val) => setAddForm({...addForm, role: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="Engineering Lead">Engineering Lead</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Frontend Dev">Frontend Dev</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Password</Label><Input type="text" placeholder="Set initial password" value={addForm.password} onChange={(e) => setAddForm({...addForm, password: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!addForm.name || !addForm.email || !addForm.password) {
                toast.error("Please fill in all required fields (Name, Email, Password)");
                return;
              }
              try {
                await createUser(addForm);
                toast.success("User added successfully");
                setOpen(false);
                setAddForm({ name: "", email: "", role: "Member", password: "" });
                queryClient.invalidateQueries({ queryKey: ["users"] });
              } catch (e) {
                toast.error("Failed to add user");
              }
            }}>Add user</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(isOpen) => { if (!isOpen) setViewUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User Details</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex justify-center mb-2">
                <Avatar className="h-20 w-20"><AvatarImage src={viewUser.avatar} /><AvatarFallback>{initials(viewUser.name)}</AvatarFallback></Avatar>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label>Full name</Label><Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Role</Label>
                  <Select value={editForm.role} onValueChange={(val) => setEditForm({...editForm, role: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Engineering Lead">Engineering Lead</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Frontend Dev">Frontend Dev</SelectItem>
                      <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Password</Label><Input type="text" placeholder="No password set" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} /></div>
              </div>
              <div className="w-full text-center mt-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-2xl font-semibold">{allTasks.filter((t: any) => t.assignee?.id === viewUser.id).length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Tasks</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex w-full sm:justify-between items-center">
            <Button variant="destructive" onClick={async () => {
              if (viewUser && confirm("Are you sure you want to delete this user?")) {
                try {
                  await deleteUser(viewUser.id);
                  toast.success("User deleted successfully");
                  setViewUser(null);
                  queryClient.invalidateQueries({ queryKey: ["users"] });
                } catch (e) {
                  toast.error("Failed to delete user");
                }
              }
            }}>Delete</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewUser(null)}>Cancel</Button>
              <Button onClick={async () => {
                if (viewUser) {
                  try {
                    await updateUser(viewUser.id, editForm);
                    toast.success("User updated successfully");
                    setViewUser(null);
                    queryClient.invalidateQueries({ queryKey: ["users"] });
                  } catch (e) {
                    toast.error("Failed to update user");
                  }
                }
              }}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
