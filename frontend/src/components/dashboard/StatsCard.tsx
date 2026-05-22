import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label, value, delta, icon: Icon, hint, accent = "primary",
}: {
  label: string; value: number; delta: number; icon: LucideIcon; hint?: string;
  accent?: "primary" | "success" | "warning" | "danger";
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  const accents: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 text-primary",
    success: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
    warning: "from-amber-500/20 to-amber-500/5 text-amber-500",
    danger: "from-rose-500/20 to-rose-500/5 text-rose-500",
  };
  const up = delta >= 0;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-primary/5"
    >
      <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl", accents[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <motion.p className="mt-2 text-3xl font-semibold tracking-tight">{rounded}</motion.p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-1.5 text-xs">
        <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium",
          up ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400")}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}{delta}%
        </span>
        <span className="text-muted-foreground">vs last week</span>
      </div>
    </motion.div>
  );
}
