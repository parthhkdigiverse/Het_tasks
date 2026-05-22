import { Bell, Search, Sun, Moon, Plus, Command as CommandIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme";
import { initials } from "@/lib/mock-data";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const me = user || { name: 'User', avatar: '' };
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button onClick={onMenu} className="md:hidden h-9 w-9 grid place-items-center rounded-md hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setCmdOpen(true)}
          className="hidden md:flex items-center gap-2 w-full max-w-md h-9 px-3 rounded-lg border border-input bg-background/60 text-sm text-muted-foreground hover:bg-accent transition"
        >
          <Search className="h-4 w-4" />
          <span>Search tasks, people, projects…</span>
          <kbd className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border bg-muted">
            <CommandIcon className="h-3 w-3" />K
          </kbd>
        </button>

        <div className="md:hidden flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 h-9" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button onClick={() => setOpen(true)} size="sm" className="hidden sm:inline-flex gap-1.5">
            <Plus className="h-4 w-4" /> New task
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-full pr-2 hover:bg-accent transition">
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={me.avatar} />
                  <AvatarFallback>{initials(me.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">{me.name.split(" ")[0]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{me.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                logout();
                window.location.href = '/login';
              }}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CreateTaskDialog open={open} onOpenChange={setOpen} />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </header>
  );
}
