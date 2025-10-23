export type TaskPriority = "high" | "medium" | "low";
export type TaskCategory = "work" | "personal" | "study" | "wellness" | "other";
export type TaskStatus = "backlog" | "in_progress" | "in_review" | "completed";

export interface Tag {
  id: string;
  name: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: string;
  status: TaskStatus;
  completed: boolean;
  tags: Tag[];
}
