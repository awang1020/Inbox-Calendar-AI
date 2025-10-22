"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { nanoid } from "nanoid";
import type { Task } from "@/types/task";
import { seededSubtasks } from "@/lib/subtaskStore";

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

const seedTasks: Task[] = [
  {
    id: "1",
    title: "Design onboarding flow",
    description: "Map out wireframes and define happy path for new users.",
    category: "work",
    priority: "high",
    deadline: new Date().toISOString(),
    status: "in_progress",
    completed: false,
    subtasks: seededSubtasks["1"]
  },
  {
    id: "2",
    title: "Study for data structures exam",
    description: "Review graphs and dynamic programming problems.",
    category: "study",
    priority: "medium",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    status: "backlog",
    completed: false,
    subtasks: []
  },
  {
    id: "3",
    title: "Weekly meal prep",
    description: "Plan balanced meals and buy groceries for the week.",
    category: "personal",
    priority: "low",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "in_review",
    completed: false,
    subtasks: seededSubtasks["3"]
  },
  {
    id: "4",
    title: "Yoga session",
    description: "45-minute restorative flow to wind down.",
    category: "wellness",
    priority: "low",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: "completed",
    completed: true,
    subtasks: []
  }
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, seedTasks);

  const addTask = useCallback((input: TaskPayload) => {
    const task: Task = {
      ...input,
      id: nanoid(),
      completed: input.completed ?? input.status === "completed",
      subtasks: input.subtasks ?? []
    };
    dispatch({ type: "ADD", payload: task });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: "UPDATE", payload: { id, updates } });
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
