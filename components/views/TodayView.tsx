"use client";

import { useMemo } from "react";
import { isBefore, isSameDay, startOfToday } from "date-fns";
import { TodayTaskCard } from "@/components/task/TodayTaskCard";
import { TaskStats } from "@/components/task/TaskStats";
import type { TaskPageRenderProps } from "@/components/layout/TaskPageContainer";
import type { Task } from "@/types/task";

interface GroupedTask {
  task: Task;
  deadline: Date | null;
}

type GroupId = "overdue" | "morning" | "afternoon" | "evening";

const groupDefinitions: { id: GroupId; title: string; description: string }[] = [
  {
    id: "overdue",
    title: "Overdue",
    description: "Make up for the tasks that slipped past."
  },
  {
    id: "morning",
    title: "Morning (0–12h)",
    description: "Ease into the day with these priorities."
  },
  {
    id: "afternoon",
    title: "Afternoon (12–18h)",
    description: "Keep momentum going through the afternoon."
  },
  {
    id: "evening",
    title: "Evening (18–24h)",
    description: "Wrap things up before the day ends."
  }
];

export function TodayView({ tasks, onEdit, onDelete, onStatusChange, openCreate }: TaskPageRenderProps) {
  const { groups, totalTasks, now } = useMemo(() => {
    const currentDate = new Date();
    const todayStart = startOfToday();

    const buckets: Record<GroupId, GroupedTask[]> = {
      overdue: [],
      morning: [],
      afternoon: [],
      evening: []
    };

    tasks.forEach((task) => {
      if (task.completed) return;

      const parsedDeadline = task.deadline ? new Date(task.deadline) : null;
      const deadline = parsedDeadline && !Number.isNaN(parsedDeadline.valueOf()) ? parsedDeadline : null;

      if (!deadline) {
        buckets.morning.push({ task, deadline: null });
        return;
      }

      if (isBefore(deadline, currentDate)) {
        buckets.overdue.push({ task, deadline });
        return;
      }

      if (!isSameDay(deadline, currentDate)) {
        if (isBefore(deadline, todayStart)) {
          buckets.overdue.push({ task, deadline });
        }
        return;
      }

      const hour = deadline.getHours();

      if (hour < 12) {
        buckets.morning.push({ task, deadline });
      } else if (hour < 18) {
        buckets.afternoon.push({ task, deadline });
      } else {
        buckets.evening.push({ task, deadline });
      }
    });

    const sortedGroups = groupDefinitions.map((definition) => ({
      ...definition,
      tasks: buckets[definition.id].sort((a, b) => {
        const aTime = a.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
        const bTime = b.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
        return aTime - bTime;
      })
    }));

    const remainingTasks = sortedGroups.reduce((sum, group) => sum + group.tasks.length, 0);

    return { groups: sortedGroups, totalTasks: remainingTasks, now: currentDate };
  }, [tasks]);

  return (
    <div className="flex flex-1 flex-col gap-6 pb-16">
      <div className="sticky top-0 z-10 -mx-6 border-b border-slate-200/80 bg-[hsl(var(--background))]/95 px-6 py-6 backdrop-blur-md dark:border-slate-800/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Today's Tasks</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Stay focused with a clear view of what needs attention today.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700/60">
              {totalTasks === 1 ? "1 task" : `${totalTasks} tasks`}
            </span>
            <button
              onClick={openCreate}
              className="inline-flex items-center rounded-full bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-white shadow-card transition hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            >
              New Task
            </button>
          </div>
        </div>
      </div>

      <TaskStats tasks={tasks} />

      {totalTasks > 0 ? (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.id} className="space-y-5">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{group.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{group.description}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                </span>
              </header>

              {group.tasks.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.tasks.map((entry) => (
                    <TodayTaskCard
                      key={entry.task.id}
                      task={entry.task}
                      deadline={entry.deadline}
                      currentDate={now}
                      isOverdue={group.id === "overdue"}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onComplete={(id) => onStatusChange(id, { status: "completed", completed: true })}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-400">
                  No tasks scheduled for this period.
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-24">
          <div className="flex max-w-md flex-col items-center gap-3 text-center">
            <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">🎉 You're all caught up for today!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">No pending tasks remain for the day. Enjoy your downtime.</p>
          </div>
        </div>
      )}
    </div>
  );
}
