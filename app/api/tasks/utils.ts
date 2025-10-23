import { Priority, TaskStatus } from "@prisma/client";

export function toTaskStatus(value?: string | null): TaskStatus | undefined {
  if (!value) return undefined;
  const key = value.toUpperCase() as keyof typeof TaskStatus;
  return TaskStatus[key] ?? TaskStatus.BACKLOG;
}

export function toPriority(value?: string | null): Priority | undefined {
  if (!value) return undefined;
  const key = value.toUpperCase() as keyof typeof Priority;
  return Priority[key] ?? Priority.MEDIUM;
}
