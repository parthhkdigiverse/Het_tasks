import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, CheckSquare, Users, User, Plus } from "lucide-react";
import { useEffect } from "react";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/tasks")}><CheckSquare className="mr-2 h-4 w-4" />Tasks</CommandItem>
          <CommandItem onSelect={() => go("/users")}><Users className="mr-2 h-4 w-4" />Users</CommandItem>
          <CommandItem onSelect={() => go("/profile")}><User className="mr-2 h-4 w-4" />Profile</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem><Plus className="mr-2 h-4 w-4" />Create new task</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
