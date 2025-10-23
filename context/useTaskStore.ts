"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "@/types/task";

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      updateTask: (updated) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === updated.id ? updated : task)),
        })),
      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
    }),
    { name: "flowtask-store" }
  )
);
