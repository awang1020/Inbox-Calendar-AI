"use client";

import { useMemo } from "react";
import type { TaskCategory, TaskPriority, TaskStatus } from "@/types/task";

export interface Filters {
  query: string;
  category: TaskCategory | "all";
  priority: TaskPriority | "all";
  status: TaskStatus | "all";
  sortBy: "deadline" | "priority" | "title";
}

interface TaskFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const categories: (TaskCategory | "all")[] = ["all", "work", "personal", "study", "wellness", "other"];
const priorities: (TaskPriority | "all")[] = ["all", "high", "medium", "low"];
const statuses: (TaskStatus | "all")[] = ["all", "backlog", "in_progress", "in_review", "completed"];

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const summary = useMemo(() => {
    const activeFilters = [
      filters.category !== "all" ? `Category: ${filters.category}` : null,
      filters.priority !== "all" ? `Priority: ${filters.priority}` : null,
      filters.status !== "all" ? `Status: ${filters.status}` : null
    ].filter(Boolean);

    return activeFilters.length ? activeFilters.join(" • ") : "Showing everything";
  }, [filters.category, filters.priority, filters.status]);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Overview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{summary}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Search
          </span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Category
          </span>
          <select
            value={filters.category}
            onChange={(event) => onChange({ ...filters, category: event.target.value as Filters["category"] })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Priority
          </span>
          <select
            value={filters.priority}
            onChange={(event) => onChange({ ...filters, priority: event.target.value as Filters["priority"] })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Status
          </span>
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as Filters["status"] })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status
                  .split("_")
                  .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Sort by
          </span>
          <select
            value={filters.sortBy}
            onChange={(event) => onChange({ ...filters, sortBy: event.target.value as Filters["sortBy"] })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
    </section>
  );
}
