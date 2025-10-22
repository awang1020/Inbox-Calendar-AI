"use client";

import { TaskProvider } from "@/context/TaskContext";
import { TaskPageContainer } from "@/components/layout/TaskPageContainer";
import { CalendarView } from "@/components/views/CalendarView";

export function CalendarPageShell() {
  return (
    <TaskProvider>
      <TaskPageContainer>{(props) => <CalendarView {...props} />}</TaskPageContainer>
    </TaskProvider>
  );
}
