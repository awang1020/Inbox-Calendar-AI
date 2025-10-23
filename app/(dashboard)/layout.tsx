"use client";

import type { ReactNode } from "react";
import { TaskPageContainer } from "@/components/layout/TaskPageContainer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <TaskPageContainer>{children}</TaskPageContainer>;
}
