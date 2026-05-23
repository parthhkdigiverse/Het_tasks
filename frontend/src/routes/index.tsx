import { createFileRoute } from "@tanstack/react-router";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CalendarCheck, ListTodo, CheckCircle2, Clock, AlertTriangle, Users as UsersIcon, ArrowRight } from "lucide-react";
import { initials } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, isToday } from "date-fns";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Link } from "@tanstack/react-router";

import { isTaskActiveOnDate } from "@/lib/utils";
import { useTasks, useActivities, useUsers, useDashboardMetrics } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { user: me } = useAuth();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(me?.id);
  const { data: activities = [], isLoading: activitiesLoading } = useActivities();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();

  const isLoading = tasksLoading || activitiesLoading || usersLoading || metricsLoading;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  const { productivityTrend = [], weeklyCompletion = [], taskDistribution = [], kpis = {} } = metrics || {};

  const todays = tasks.filter((t: any) => isTaskActiveOnDate(t, new Date())).slice(0, 4);
  const due = tasks.filter((t: any) => new Date(t.dueDate) < new Date() && t.status !== "completed").slice(0, 4);
  const upcoming = tasks.filter((t: any) => new Date(t.dueDate) > new Date()).slice(0, 4);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Good afternoon, Sarah 👋</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Welcome back to TaskFlow</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button asChild><Link to="/tasks">Go to Tasks <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatsCard label="Today's Tasks" value={kpis.todayTasks || 0} delta={0} icon={CalendarCheck} accent="primary" />
        <StatsCard label="This Week" value={kpis.thisWeekTasks || 0} delta={0} icon={ListTodo} accent="primary" />
        <StatsCard label="Completed" value={kpis.completedTasks || 0} delta={0} icon={CheckCircle2} accent="success" />
        <StatsCard label="Pending" value={kpis.pendingTasks || 0} delta={0} icon={Clock} accent="warning" />
        <StatsCard label="Overdue" value={kpis.overdueTasks || 0} delta={0} icon={AlertTriangle} accent="danger" />
        <StatsCard label="Total Users" value={kpis.totalUsers || 0} delta={0} icon={UsersIcon} accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Productivity</h2>
              <p className="text-xs text-muted-foreground">Last 14 days</p>
            </div>
            <Badge variant="secondary" className="text-emerald-600 bg-emerald-500/10">↑ 24%</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Task distribution</h2>
          <p className="text-xs text-muted-foreground">Overall split</p>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskDistribution} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={4} stroke="none">
                  {taskDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 text-sm">
            {taskDistribution.map((d) => (
              <li key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}</span>
                <span className="font-medium">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Weekly completion</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Completed</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />Created</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCompletion} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="created" radius={[6, 6, 0, 0]} fill="var(--color-muted-foreground)" opacity={0.3} />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-1">Recent activity</h2>
          <p className="text-xs text-muted-foreground mb-3">Team updates</p>
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8"><AvatarImage src={a.user.avatar} /><AvatarFallback>{initials(a.user.name)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{a.user.name}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: "Today", list: todays },
          { title: "Due", list: due },
          { title: "Upcoming", list: upcoming },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{s.title}</h2>
              <Link to="/tasks" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2.5">
              {s.list.length ? s.list.map((t) => <TaskCard key={t.id} task={t} draggable={false} />) : (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">All clear ✨</div>
              )}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
