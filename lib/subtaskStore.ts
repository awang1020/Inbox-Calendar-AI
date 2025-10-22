import { nanoid } from "nanoid";
import type { Subtask } from "@/types/task";

type SubtaskInput = Pick<Subtask, "title"> & Partial<Pick<Subtask, "done" | "order" >>;

const subtasksByTask = new Map<string, Subtask[]>();

const defaultSubtasks: Record<string, Subtask[]> = {
  "1": [
    { id: "1-1", taskId: "1", title: "Draft user journey", done: true, order: 0 },
    { id: "1-2", taskId: "1", title: "Review with PM", done: false, order: 1 },
    { id: "1-3", taskId: "1", title: "Prepare mockups", done: false, order: 2 }
  ],
  "3": [
    { id: "3-1", taskId: "3", title: "Plan recipes", done: true, order: 0 },
    { id: "3-2", taskId: "3", title: "Create shopping list", done: false, order: 1 }
  ]
};

function sortSubtasks(subtasks: Subtask[]): Subtask[] {
  return [...subtasks].sort((a, b) => a.order - b.order);
}

export function getSubtasks(taskId: string): Subtask[] {
  const subtasks = subtasksByTask.get(taskId) ?? [];
  const normalized = sortSubtasks(
    subtasks.map((subtask, index) => ({
      ...subtask,
      order: typeof subtask.order === "number" ? subtask.order : index
    }))
  );
  subtasksByTask.set(taskId, normalized);
  return normalized;
}

export function addSubtask(taskId: string, input: SubtaskInput): Subtask {
  const subtasks = getSubtasks(taskId);
  const order =
    typeof input.order === "number"
      ? input.order
      : subtasks.length > 0
        ? Math.max(...subtasks.map((subtask) => subtask.order)) + 1
        : 0;

  const subtask: Subtask = {
    id: nanoid(),
    taskId,
    title: input.title.trim(),
    done: input.done ?? false,
    order
  };

  const updated = sortSubtasks([...subtasks, subtask]);
  subtasksByTask.set(taskId, updated);
  return subtask;
}

export function updateSubtask(
  taskId: string,
  subtaskId: string,
  updates: Partial<Omit<Subtask, "id" | "taskId">>
): Subtask {
  const subtasks = getSubtasks(taskId);
  const index = subtasks.findIndex((subtask) => subtask.id === subtaskId);

  if (index === -1) {
    throw new Error("Subtask not found");
  }

  const updatedSubtask: Subtask = {
    ...subtasks[index],
    ...updates,
    order: updates.order ?? subtasks[index].order
  };

  const next = [...subtasks];
  next[index] = updatedSubtask;
  const normalized = sortSubtasks(next);
  subtasksByTask.set(taskId, normalized);
  return updatedSubtask;
}

export function deleteSubtask(taskId: string, subtaskId: string): void {
  const subtasks = getSubtasks(taskId);
  const filtered = subtasks.filter((subtask) => subtask.id !== subtaskId);
  subtasksByTask.set(taskId, filtered);
}

export function reorderSubtasks(taskId: string, orderedIds: string[]): Subtask[] {
  const subtasks = getSubtasks(taskId);
  const subtaskMap = new Map(subtasks.map((subtask) => [subtask.id, subtask] as const));

  const reordered: Subtask[] = orderedIds
    .map((id, index) => {
      const current = subtaskMap.get(id);
      if (!current) return null;
      return {
        ...current,
        order: index
      } satisfies Subtask;
    })
    .filter(Boolean) as Subtask[];

  subtasksByTask.set(taskId, reordered);
  return reordered;
}

export function seedSubtasks(taskId: string, items: Subtask[]): void {
  subtasksByTask.set(taskId, sortSubtasks(items));
}

Object.entries(defaultSubtasks).forEach(([taskId, items]) => {
  seedSubtasks(taskId, items);
});

export const seededSubtasks = defaultSubtasks;
