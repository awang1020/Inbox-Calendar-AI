"use client";

import { useMemo } from "react";
import { addHours } from "date-fns";
import { Calendar, Views, type EventPropGetter } from "react-big-calendar";
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

const priorityPalette: Record<TaskPriority, string> = {
  high: "#f43f5e",
  medium: "#f59e0b",
  low: "#10b981"
};

const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
  const priority = event.resource.priority ?? "medium";

  return {
    className: "rounded-xl border-none shadow-sm",
    style: {
      backgroundColor: priorityPalette[priority],
      color: "#fff"
    }
  };
};

export function CalendarView({ tasks, onEdit }: TaskPageRenderProps) {
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

  return (
    <>
      <TaskStats tasks={tasks} />

      <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50">
        <Calendar
          localizer={calendarLocalizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "65vh" }}
          popup
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.WEEK}
          eventPropGetter={eventPropGetter}
          onSelectEvent={(event) => onEdit(event.resource)}
        />
      </section>
    </>
  );
}
