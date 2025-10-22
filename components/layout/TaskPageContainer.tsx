"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { TaskForm } from "@/components/task/TaskForm";
import { useTasks } from "@/context/TaskContext";
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
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  function openCreate() {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  function handleSubmit(task: Task) {
    const { id: _ignored, ...payload } = task;
    const normalized = {
      ...payload,
      completed: payload.completed || payload.status === "completed"
    };

    if (editingTask) {
      updateTask(editingTask.id, normalized);
    } else {
      addTask(normalized);
    }

    setIsFormOpen(false);
    setEditingTask(null);
  }

  function handleDelete(id: string) {
    deleteTask(id);
  }

  const content =
    typeof children === "function"
      ? children({
          tasks,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onStatusChange: updateTask,
          openCreate
        })
      : children;

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[hsl(var(--background))]">
      <AppHeader onCreate={openCreate} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-16">{content}</main>

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
  );
}
