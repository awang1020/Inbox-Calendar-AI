"use client";

import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { addHours, format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Views, type EventPropGetter, type View, type EventProps } from "react-big-calendar";
import { Plus } from "lucide-react";
import { TaskStats } from "@/components/task/TaskStats";
import type { TaskPageRenderProps } from "@/components/layout/TaskPageContainer";
import type { Task, TaskPriority } from "@/types/task";
import { calendarLocalizer } from "@/lib/calendar";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

const priorityStyles: Record<TaskPriority, { backgroundColor: string; color: string }> = {
  high: { backgroundColor: "#ef4444", color: "#ffffff" },
  medium: { backgroundColor: "#f59e0b", color: "#111827" },
  low: { backgroundColor: "#22c55e", color: "#ffffff" }
};

const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
  const priority = event.resource.priority ?? "medium";
  const { backgroundColor, color } = priorityStyles[priority];

  return {
    className: clsx("calendar-event", `priority-${priority}`),
    style: {
      backgroundColor,
      color
    }
  };
};

const viewOptions: { label: string; value: View }[] = [
  { label: "Month", value: Views.MONTH },
  { label: "Week", value: Views.WEEK },
  { label: "Day", value: Views.DAY }
];

export function CalendarView({ tasks, onEdit, openCreate }: TaskPageRenderProps) {
  const events = useMemo<CalendarEvent[]>(
    () =>
      tasks
        .filter((task) => !!task.deadline)
        .map((task) => {
          const start = new Date(task.deadline!);
          return {
            id: task.id,
            title: task.title,
            start,
            end: addHours(start, 1),
            resource: task
          };
        }),
    [tasks]
  );

  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const CalendarEventComponent = useCallback(
    ({ event }: EventProps<CalendarEvent>) => {
      const category = event.resource.category ?? "General";
      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
      const dueTime = format(event.start, "MMM d • h:mm a");
      const priority = event.resource.priority ?? "medium";
      const { color } = priorityStyles[priority];
      const isMediumPriority = priority === "medium";
      const primaryTextClass = isMediumPriority ? "text-slate-900" : "text-white";
      const secondaryTextClass = isMediumPriority ? "text-slate-800" : "text-white/80";
      const tertiaryTextClass = isMediumPriority ? "text-slate-700" : "text-white/70";

      return (
        <div className="group relative flex flex-col gap-0.5 text-xs" style={{ color }}>
          <span className={clsx("text-sm font-semibold leading-tight", primaryTextClass)}>
            {event.title}
          </span>
          <span
            className={clsx(
              "text-[11px] font-medium uppercase tracking-wide",
              secondaryTextClass
            )}
          >
            {categoryLabel}
          </span>
          <span className={clsx("text-[11px]", tertiaryTextClass)}>{dueTime}</span>

          <div className="pointer-events-none absolute left-1/2 top-0 hidden w-56 -translate-x-1/2 -translate-y-full rounded-xl bg-slate-900/95 p-3 text-left text-[11px] text-slate-100 shadow-xl ring-1 ring-white/10 transition group-hover:block">
            <p className="text-sm font-semibold leading-tight text-white">{event.title}</p>
            <p className="mt-1 font-medium uppercase tracking-wide text-[10px] text-slate-300">{categoryLabel}</p>
            <p className="mt-1 text-xs text-slate-200">Due {dueTime}</p>
          </div>
        </div>
      );
    },
    []
  );

  return (
    <>
      <TaskStats tasks={tasks} />

      <section className="relative flex flex-col gap-6 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-[#1e293b] dark:bg-[#0b162c]/90">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">📆 Calendar View</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stay on top of your roadmap with a focused schedule.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1 dark:bg-slate-800/60">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> High Priority
              </span>
              <span className="flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1 dark:bg-slate-800/60">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Medium Priority
              </span>
              <span className="flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1 dark:bg-slate-800/60">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" /> Low Priority
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 self-end">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCurrentView(option.value)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]",
                  currentView === option.value
                    ? "border-transparent bg-[hsl(var(--accent))] text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                )}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <div className="relative rounded-2xl border border-slate-200/60 bg-white/60 shadow-inner dark:border-[#1e293b] dark:bg-[#0f172a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-[65vh]"
            >
              <Calendar
                localizer={calendarLocalizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={currentView}
                onView={(view) => setCurrentView(view)}
                popup
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                eventPropGetter={eventPropGetter}
                components={{ toolbar: () => null, event: CalendarEventComponent }}
                style={{ height: "100%" }}
                onSelectEvent={(event) => onEdit(event.resource)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <button
        onClick={openCreate}
        className="fixed bottom-8 right-8 hidden items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] md:flex"
        type="button"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </button>
    </>
  );
}
