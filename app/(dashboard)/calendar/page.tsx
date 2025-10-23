"use client";

import { CalendarView } from "@/components/views/CalendarView";
import { useTaskPage } from "@/components/layout/TaskPageContext";

export default function CalendarPage() {
  const taskPage = useTaskPage();
  return <CalendarView {...taskPage} />;
}
