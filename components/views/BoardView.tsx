"use client";

import { useMemo, useState } from "react";
import { TaskBoard } from "@/components/task/TaskBoard";
import { TaskFilters, type Filters } from "@/components/task/TaskFilters";
import { TaskStats } from "@/components/task/TaskStats";
import type { Task } from "@/types/task";
import type { TaskPageRenderProps } from "@/components/layout/TaskPageContainer";

const defaultFilters: Filters = {
  query: "",
  category: "all",
  priority: "all",
  status: "all",
  sortBy: "deadline"
};

function filterTasks(tasks: Task[], filters: Filters) {
  return tasks
    .filter((task) => {
      const matchesQuery = filters.query
        ? task.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          task.description?.toLowerCase().includes(filters.query.toLowerCase())
        : true;
      const matchesCategory = filters.category === "all" ? true : task.category === filters.category;
      const matchesPriority = filters.priority === "all" ? true : task.priority === filters.priority;
      const matchesStatus = filters.status === "all" ? true : task.status === filters.status;

      return matchesQuery && matchesCategory && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "priority": {
          const order = { high: 0, medium: 1, low: 2 } as const;
          return order[a.priority] - order[b.priority];
        }
        case "title":
          return a.title.localeCompare(b.title);
        case "deadline":
        default: {
          const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return da - db;
        }
      }
    });
}

export function BoardView({ tasks, onEdit, onDelete, onStatusChange }: TaskPageRenderProps) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);

  return (
    <>
      <TaskStats tasks={tasks} />
      <TaskFilters filters={filters} onChange={setFilters} />
      <TaskBoard
        tasks={filteredTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    </>
  );
}
