"use client";

import { useMemo } from "react";
import { isSameDay } from "date-fns";
import { TaskCard } from "@/components/task/TaskCard";
import { TaskStats } from "@/components/task/TaskStats";
import type { TaskPageRenderProps } from "@/components/layout/TaskPageContainer";
import type { TaskPriority } from "@/types/task";

const priorityOrder: TaskPriority[] = ["high", "medium", "low"];
const priorityLabels: Record<TaskPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority"
};
const priorityColors: Record<TaskPriority, string> = {
  high: "from-rose-500/20 to-rose-500/10 text-rose-600 dark:text-rose-300",
  medium: "from-amber-500/20 to-amber-500/10 text-amber-600 dark:text-amber-300",
  low: "from-emerald-500/20 to-emerald-500/10 text-emerald-600 dark:text-emerald-300"
};

export function TodayView({ tasks, onEdit, onDelete, onStatusChange }: TaskPageRenderProps) {
  const groupedTasks = useMemo(() => {
    const today = new Date();
    const dueToday = tasks.filter((task) => task.deadline && isSameDay(new Date(task.deadline), today));

    return priorityOrder.map((priority) => ({
      priority,
      tasks: dueToday.filter((task) => task.priority === priority)
    }));
  }, [tasks]);

  const hasDueTasks = groupedTasks.some((group) => group.tasks.length > 0);

  return (
    <>
      <TaskStats tasks={tasks} />

      {hasDueTasks ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {groupedTasks.map((group) => (
            <div
              key={group.priority}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
            >
              <header className={`rounded-2xl bg-gradient-to-br px-4 py-3 text-sm font-semibold ${priorityColors[group.priority]}`}>
                {priorityLabels[group.priority]}
              </header>

              {group.tasks.length ? (
                <div className="space-y-3">
                  {group.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                  No {group.priority} priority tasks due today.
                </p>
              )}
            </div>
          ))}
        </section>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-16 text-center shadow-inner dark:border-slate-700/70 dark:bg-slate-900/40">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">You're all caught up!</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">No tasks are due today. Enjoy the breather.</p>
        </div>
      )}
    </>
  );
}
