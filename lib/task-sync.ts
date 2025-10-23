import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";

export type ApiTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  dueAt: string | null;
  userId: string;
};

const CATEGORY_VALUES: TaskCategory[] = ["work", "personal", "study", "wellness", "other"];
const PRIORITY_VALUES: TaskPriority[] = ["high", "medium", "low"];
const STATUS_VALUES: TaskStatus[] = ["backlog", "in_progress", "in_review", "completed"];

function normalizeCategory(value: string | null | undefined, fallback: TaskCategory = "other"): TaskCategory {
  if (!value) return fallback;
  const normalized = value.toLowerCase() as TaskCategory;
  return CATEGORY_VALUES.includes(normalized) ? normalized : fallback;
}

function normalizePriority(value: string | null | undefined, fallback: TaskPriority = "medium"): TaskPriority {
  if (!value) return fallback;
  const normalized = value.toLowerCase() as TaskPriority;
  return PRIORITY_VALUES.includes(normalized) ? normalized : fallback;
}

function normalizeStatus(value: string | null | undefined, fallback: TaskStatus = "backlog"): TaskStatus {
  if (!value) return fallback;
  const normalized = value.toLowerCase() as TaskStatus;
  return STATUS_VALUES.includes(normalized) ? normalized : fallback;
}

function toIsoString(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function mapApiTask(task: ApiTask, existing?: Task): Task {
  const status = normalizeStatus(task.status, existing?.status);
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description ?? undefined,
    category: normalizeCategory(task.category, existing?.category),
    priority: normalizePriority(task.priority, existing?.priority),
    deadline: task.dueAt ?? undefined,
    status,
    completed: status === "completed",
    tags: existing?.tags ?? [],
  };
}

export function buildCreatePayload(
  task: Pick<Task, "title" | "description" | "status" | "priority" | "category" | "deadline">
) {
  return {
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueAt: toIsoString(task.deadline ?? undefined),
  };
}

export function buildUpdatePayload(task: Partial<Task>) {
  const payload: Record<string, unknown> = {};

  if (task.title !== undefined) payload.title = task.title;
  if (task.description !== undefined) payload.description = task.description ?? null;
  if (task.status !== undefined) payload.status = task.status;
  if (task.priority !== undefined) payload.priority = task.priority;
  if (task.category !== undefined) payload.category = task.category;
  if (task.deadline !== undefined) payload.dueAt = toIsoString(task.deadline);

  return payload;
}
