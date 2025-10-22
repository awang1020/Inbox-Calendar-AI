"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { nanoid } from "nanoid";
import type { Tag, Task, TaskTag } from "@/types/task";

export type TaskPayload = Omit<Task, "id" | "completed"> & {
  completed?: boolean;
};

interface TaskContextValue {
  tasks: Task[];
  addTask: (input: TaskPayload) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

type TaskAction =
  | { type: "ADD"; payload: Task }
  | { type: "UPDATE"; payload: { id: string; updates: Partial<Task> } }
  | { type: "DELETE"; payload: string };

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "ADD":
      return [action.payload, ...state];
    case "UPDATE":
      return state.map((task) => (task.id === action.payload.id ? { ...task, ...action.payload.updates } : task));
    case "DELETE":
      return state.filter((task) => task.id !== action.payload);
    default:
      return state;
  }
}

const seedTags: Tag[] = [
  { id: "design", name: "Design" },
  { id: "research", name: "Research" },
  { id: "frontend", name: "Frontend" },
  { id: "study", name: "Study" },
  { id: "personal", name: "Personal" },
  { id: "wellness", name: "Wellness" }
];

const seedTaskTags: TaskTag[] = [
  { taskId: "1", tagId: "design" },
  { taskId: "1", tagId: "research" },
  { taskId: "1", tagId: "frontend" },
  { taskId: "2", tagId: "study" },
  { taskId: "3", tagId: "personal" },
  { taskId: "4", tagId: "wellness" }
];

const baseTasks: Omit<Task, "tags">[] = [
  {
    id: "1",
    title: "Design onboarding flow",
    description: "Map out wireframes and define happy path for new users.",
    category: "work",
    priority: "high",
    deadline: "2024-05-18T17:00:00.000Z",
    status: "in_progress",
    completed: false
  },
  {
    id: "2",
    title: "Study for data structures exam",
    description: "Review graphs and dynamic programming problems.",
    category: "study",
    priority: "medium",
    deadline: "2024-05-21T15:00:00.000Z",
    status: "backlog",
    completed: false
  },
  {
    id: "3",
    title: "Weekly meal prep",
    description: "Plan balanced meals and buy groceries for the week.",
    category: "personal",
    priority: "low",
    deadline: "2024-05-19T19:30:00.000Z",
    status: "in_review",
    completed: false
  },
  {
    id: "4",
    title: "Yoga session",
    description: "45-minute restorative flow to wind down.",
    category: "wellness",
    priority: "low",
    deadline: "2024-05-19T12:00:00.000Z",
    status: "completed",
    completed: true
  }
];

const tagIndex = new Map(seedTags.map((tag) => [tag.id, tag]));

const seedTasks: Task[] = baseTasks.map((task) => ({
  ...task,
  tags: seedTaskTags
    .filter((relation) => relation.taskId === task.id)
    .map((relation) => tagIndex.get(relation.tagId)!)
}));

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, seedTasks);

  const addTask = useCallback((input: TaskPayload) => {
    const task: Task = {
      ...input,
      id: nanoid(),
      tags: input.tags ?? [],
      completed: input.completed ?? input.status === "completed"
    };
    dispatch({ type: "ADD", payload: task });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const normalizedUpdates = { ...updates };

    if ("status" in updates && typeof updates.completed === "undefined") {
      normalizedUpdates.completed = updates.status === "completed";
    }

    dispatch({ type: "UPDATE", payload: { id, updates: normalizedUpdates } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "DELETE", payload: id });
  }, []);

  const value = useMemo(
    () => ({
      tasks: state,
      addTask,
      updateTask,
      deleteTask
    }),
    [state, addTask, updateTask, deleteTask]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }

  return context;
}
