"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskBoard } from "@/components/task/TaskBoard";
import { TaskForm } from "@/components/task/TaskForm";
import { TaskFilters, type Filters } from "@/components/task/TaskFilters";
import { TaskStats } from "@/components/task/TaskStats";
import { TaskProvider, useTasks } from "@/context/TaskContext";
import type { Task } from "@/types/task";
import { AppHeader } from "./AppHeader";

const defaultFilters: Filters = {
  query: "",
  category: "all",
  priority: "all",
  status: "all",
  sortBy: "deadline"
};

function DashboardShell() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTasks = tasks
    .filter((task) => {
      const matchesQuery = filters.query
        ? task.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          task.description?.toLowerCase().includes(filters.query.toLowerCase())
        : true;
      const matchesCategory = filters.category === "all" ? true : task.category === filters.category;
      const matchesPriority = filters.priority === "all" ? true : task.priority === filters.priority;
      const matchesStatus = filters.status === "all" ? true : task.status === filters.status;

      return matchesQuery && matchesCategory && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "priority": {
          const order = { high: 0, medium: 1, low: 2 } as const;
          return order[a.priority] - order[b.priority];
        }
        case "title":
          return a.title.localeCompare(b.title);
        case "deadline":
        default: {
          const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return da - db;
        }
      }
    });

  function handleEditTask(task: Task) {
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

  function handleDeleteTask(id: string) {
    deleteTask(id);
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[hsl(var(--background))]">
      <AppHeader onCreate={() => setIsFormOpen(true)} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-16">
        <TaskStats tasks={tasks} />
        <TaskFilters filters={filters} onChange={setFilters} />

        <TaskBoard tasks={filteredTasks} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={updateTask} />
      </main>

      <button
        onClick={() => {
          setEditingTask(null);
          setIsFormOpen(true);
        }}
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

export function AppShell() {
  return (
    <TaskProvider>
      <DashboardShell />
    </TaskProvider>
  );
}
