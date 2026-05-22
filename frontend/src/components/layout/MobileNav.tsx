import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CheckSquare, Users, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/users", label: "Users", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16 items-center">
          {items.slice(0, 2).map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link key={to} to={to} className={cn("flex flex-col items-center justify-center gap-0.5 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="h-5 w-5" /> {label}
              </Link>
            );
          })}
          <div className="flex justify-center">
            <button
              onClick={() => setOpen(true)}
              className="-mt-6 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg shadow-primary/40 active:scale-95 transition"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          {items.slice(2).map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link key={to} to={to} className={cn("flex flex-col items-center justify-center gap-0.5 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="h-5 w-5" /> {label}
              </Link>
            );
          })}
        </div>
      </nav>
      <CreateTaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
