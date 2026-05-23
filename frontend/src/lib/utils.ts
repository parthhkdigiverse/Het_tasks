import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isSameDay, startOfDay, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTaskActiveOnDate(task: any, date: Date) {
  if (!task.dueDate) return false;
  const tDate = task.dueDate === "Tomorrow" ? new Date(Date.now() + 86400000) : new Date(task.dueDate);
  const isPastStart = date >= startOfDay(tDate);
  
  if (task.recurrence === "daily") {
    return isPastStart;
  }
  if (task.recurrence === "weekly" && task.recurrenceDays && task.recurrenceDays.length > 0) {
    const dayName = format(date, "EEE");
    return isPastStart && task.recurrenceDays.includes(dayName);
  }
  if (task.recurrence === "monthly") {
    return isPastStart && date.getDate() === tDate.getDate();
  }
  
  return isSameDay(tDate, date);
}
