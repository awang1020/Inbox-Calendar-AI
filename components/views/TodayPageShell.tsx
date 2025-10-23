"use client";

import { TaskPageContainer } from "@/components/layout/TaskPageContainer";
import { TodayView } from "@/components/views/TodayView";

export function TodayPageShell() {
  return (
    <TaskPageContainer>{(props) => <TodayView {...props} />}</TaskPageContainer>
  );
}
