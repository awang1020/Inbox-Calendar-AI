"use client";

import { TaskPageContainer } from "@/components/layout/TaskPageContainer";
import { CalendarView } from "@/components/views/CalendarView";

export function CalendarPageShell() {
  return (
    <TaskPageContainer>{(props) => <CalendarView {...props} />}</TaskPageContainer>
  );
}
