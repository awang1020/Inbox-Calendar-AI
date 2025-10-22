export type TaskPriority = "high" | "medium" | "low";
export type TaskCategory = "work" | "personal" | "study" | "wellness" | "other";
export type TaskStatus = "backlog" | "in_progress" | "in_review" | "completed";

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: string;
  status: TaskStatus;
  completed: boolean;
  subtasks?: Subtask[];
}
