"use client";

import { createContext, useContext } from "react";
import type { TaskPageRenderProps } from "@/components/layout/TaskPageContainer";

const TaskPageContext = createContext<TaskPageRenderProps | null>(null);

export function TaskPageProvider({
  value,
  children
}: {
  value: TaskPageRenderProps;
  children: React.ReactNode;
}) {
  return <TaskPageContext.Provider value={value}>{children}</TaskPageContext.Provider>;
}

export function useTaskPage() {
  const context = useContext(TaskPageContext);
  if (!context) {
    throw new Error("useTaskPage must be used within a TaskPageProvider");
  }
  return context;
}
