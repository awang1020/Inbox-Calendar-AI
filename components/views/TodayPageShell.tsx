"use client";

import { TaskProvider } from "@/context/TaskContext";
import { TaskPageContainer } from "@/components/layout/TaskPageContainer";
import { TodayView } from "@/components/views/TodayView";

export function TodayPageShell() {
  return (
    <TaskProvider>
      <TaskPageContainer>{(props) => <TodayView {...props} />}</TaskPageContainer>
    </TaskProvider>
  );
}
