export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "pending" | "in-progress" | "completed" | "overdue" | "cancelled";
export type Recurrence = "one-time" | "daily" | "weekly" | "monthly" | "custom";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  online: boolean;
  activeTasks: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: User;
  assignedBy?: User;
  dueDate: string; // ISO
  priority: Priority;
  status: Status;
  recurrence: Recurrence;
  carryOver?: boolean;
  progress: number;
  reminder: boolean;
  tags: string[];
}

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");

export { initials };
