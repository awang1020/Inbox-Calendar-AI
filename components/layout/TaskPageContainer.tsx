"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { nanoid } from "nanoid";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { TaskForm } from "@/components/task/TaskForm";
import { TaskPageProvider } from "@/components/layout/TaskPageContext";
import { useTaskStore } from "@/context/useTaskStore";
import {
  buildCreatePayload,
  buildUpdatePayload,
  mapApiTask,
  type ApiTask,
} from "@/lib/task-sync";
import { DEFAULT_USER_ID } from "@/lib/constants";
import type { Task } from "@/types/task";

export interface TaskPageRenderProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, updates: Partial<Task>) => void;
  openCreate: () => void;
}

interface TaskPageContainerProps {
  children: ReactNode | ((props: TaskPageRenderProps) => ReactNode);
}

export function TaskPageContainer({ children }: TaskPageContainerProps) {
  const { status } = useSession();
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const replaceTask = useTaskStore((state) => state.updateTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const hasFetchedRef = useRef(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let isCancelled = false;

    async function fetchTasks() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        const data = (await response.json()) as ApiTask[];
        if (isCancelled) return;

        const currentTasks = useTaskStore.getState().tasks;
        const currentTaskMap = new Map(currentTasks.map((task) => [task.id, task]));
        const normalized = data.map((task) => mapApiTask(task, currentTaskMap.get(task.id)));
        setTasks(normalized);
      } catch (error) {
        console.error(error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      isCancelled = true;
    };
  }, [status, setTasks]);

  function openCreate() {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  async function handleSubmit(task: Task) {
    const normalized: Task = {
      ...task,
      completed: task.completed || task.status === "completed",
      tags: task.tags ?? [],
    };

    if (status !== "authenticated") {
      if (editingTask) {
        replaceTask(normalized);
      } else {
        const generatedId =
          normalized.id && normalized.id !== "temp"
            ? normalized.id
            : typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : nanoid();

        addTask({
          ...normalized,
          id: generatedId,
          userId: normalized.userId ?? DEFAULT_USER_ID,
        });
      }

      setIsFormOpen(false);
      setEditingTask(null);
      return;
    }

    try {
      if (editingTask) {
        const { tags, completed, id: _ignored, userId: _userId, ...rest } = normalized;
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildUpdatePayload(rest)),
        });

        if (!response.ok) {
          throw new Error(`Failed to update task: ${response.status}`);
        }

        const data = (await response.json()) as ApiTask;
        const updatedTask = mapApiTask(data, { ...editingTask, tags });
        replaceTask({ ...updatedTask, tags });
      } else {
        const { tags, completed, id: _ignored, userId: _userId, ...rest } = normalized;
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            buildCreatePayload({
              title: rest.title,
              description: rest.description,
              status: rest.status,
              priority: rest.priority,
              category: rest.category,
              deadline: rest.deadline,
            })
          ),
        });

        if (!response.ok) {
          throw new Error(`Failed to create task: ${response.status}`);
        }

        const data = (await response.json()) as ApiTask;
        const newTask = mapApiTask(data);
        addTask({ ...newTask, tags });
      }

      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    const existing = tasks.find((task) => task.id === id);
    removeTask(id);

    if (status !== "authenticated" || !existing) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      // Restore the task if deletion failed
      replaceTask(existing);
    }
  }

  async function handleStatusChange(id: string, updates: Partial<Task>) {
    const existing = tasks.find((task) => task.id === id);
    if (!existing) return;

    const merged: Task = {
      ...existing,
      ...updates,
      completed:
        typeof updates.completed !== "undefined"
          ? updates.completed
          : (updates.status ?? existing.status) === "completed",
      tags: updates.tags ?? existing.tags,
    };

    replaceTask(merged);

    if (status !== "authenticated") {
      return;
    }

    try {
      const { tags, completed, id: _ignored, userId: _userId, ...rest } = merged;
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildUpdatePayload(rest)),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const data = (await response.json()) as ApiTask;
      const updatedTask = mapApiTask(data, { ...merged, tags });
      replaceTask({ ...updatedTask, tags });
    } catch (error) {
      console.error(error);
      replaceTask(existing);
    }
  }

  const renderProps: TaskPageRenderProps = {
    tasks,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onStatusChange: handleStatusChange,
    openCreate
  };

  const content =
    typeof children === "function"
      ? children(renderProps)
      : children;

  return (
    <TaskPageProvider value={renderProps}>
      <div className="flex min-h-screen flex-col gap-6 bg-[hsl(var(--background))]">
        <AppHeader onCreate={openCreate} />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-16">
          {isLoading && !tasks.length ? (
            <div className="flex flex-1 items-center justify-center py-24 text-sm text-slate-500 dark:text-slate-400">
              Loading tasks...
            </div>
          ) : (
            content
          )}
        </main>

        <button
          onClick={openCreate}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-white shadow-card transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] md:hidden"
          aria-label="Add new task"
        >
          <Plus className="h-6 w-6" />
        </button>

        <TaskForm
          key={editingTask?.id ?? "new"}
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingTask(null);
          }}
          onSubmit={handleSubmit}
          task={editingTask}
        />
      </div>
    </TaskPageProvider>
  );
}
