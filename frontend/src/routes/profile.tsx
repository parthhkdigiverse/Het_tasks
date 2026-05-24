import { createFileRoute } from "@tanstack/react-router";
import { initials } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { updateUser, useTasks } from "@/lib/api";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user: me, login } = useAuth();
  const [name, setName] = useState(me?.name || "");
  const [email, setEmail] = useState(me?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const { data: allTasks = [] } = useTasks();

  if (!me) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  return (
    <div className="space-y-5 max-w-5xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account, preferences and notifications.</p>
      </header>

      <div className="rounded-2xl border bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-card p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-4 ring-background"><AvatarImage src={me.avatar} /><AvatarFallback>{initials(me.name)}</AvatarFallback></Avatar>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{me.name}</h2>
            <p className="text-sm text-muted-foreground">{me.role} · {me.email}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span><b className="text-foreground">{allTasks.filter((t: any) => t.assignee?.id === me.id).length}</b> total tasks</span>
              <span><b className="text-foreground">98%</b> on-time</span>
            </div>
          </div>
          <Button 
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              try {
                await updateUser(me.id, { name, email });
                login({ ...me, name, email });
                toast.success("Profile saved successfully");
              } catch (e) {
                toast.error("Failed to save profile");
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-4">
          <div className="rounded-2xl border bg-card p-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Full name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>

            <div className="md:col-span-2 space-y-2"><Label>Bio</Label><Input defaultValue="Product manager focused on craft and velocity." /></div>
          </div>
        </TabsContent>



        <TabsContent value="security" className="mt-4">
          <div className="rounded-2xl border bg-card p-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2"><Label>Current password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-2"><Label>New password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-2"><Label>Confirm password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="md:col-span-2"><Button onClick={() => toast.success("Password updated")}>Update password</Button></div>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}
