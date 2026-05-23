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
  if (task.recurrence === "weekly") {
    if (task.recurrenceDays && task.recurrenceDays.length > 0) {
      const dayName = format(date, "EEE");
      return isPastStart && task.recurrenceDays.includes(dayName);
    } else {
      // Fallback: recur on the same day of the week as the due date
      return isPastStart && date.getDay() === tDate.getDay();
    }
  }
  if (task.recurrence === "monthly") {
    return isPastStart && date.getDate() === tDate.getDate();
  }
  
  return isSameDay(tDate, date);
}

import { addDays } from "date-fns";

export function getNextOccurrence(dateStr: string, days: string[]) {
  if (!days || days.length === 0) return dateStr;
  
  let date = new Date(dateStr);
  if (!dateStr.includes('T')) {
    const parts = dateStr.split('-');
    date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  
  for (let i = 0; i < 7; i++) {
    const d = addDays(date, i);
    if (days.includes(format(d, 'EEE'))) {
      return format(d, 'yyyy-MM-dd');
    }
  }
  return dateStr;
}
