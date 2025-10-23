"use client";

import { TodayView } from "@/components/views/TodayView";
import { useTaskPage } from "@/components/layout/TaskPageContext";

export default function TodayPage() {
  const taskPage = useTaskPage();
  return <TodayView {...taskPage} />;
}
