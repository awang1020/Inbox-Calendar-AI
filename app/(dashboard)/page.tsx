"use client";

import { BoardView } from "@/components/views/BoardView";
import { useTaskPage } from "@/components/layout/TaskPageContext";

export default function HomePage() {
  const taskPage = useTaskPage();
  return <BoardView {...taskPage} />;
}
