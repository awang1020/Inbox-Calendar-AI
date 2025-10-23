"use client";

import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { endOfWeek, format, isAfter, isBefore, isWithinInterval, startOfWeek, subWeeks } from "date-fns";
import { AlertTriangle, CheckCircle2, ClipboardList, PieChart as PieChartIcon } from "lucide-react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Cell } from "@/lib/recharts";
import { useTaskStore } from "@/context/useTaskStore";
import { mapApiTask, type ApiTask } from "@/lib/task-sync";

const STATUS_COLORS: Record<string, string> = {
  backlog: "#6366F1",
  in_progress: "#F97316",
  in_review: "#0EA5E9",
  completed: "#22C55E"
};

const CATEGORY_COLORS = ["#6366F1", "#F97316", "#0EA5E9", "#8B5CF6", "#22C55E", "#EC4899"];

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDeadlineDate(deadline?: string) {
  if (!deadline) return null;
  const parsed = new Date(deadline);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function AnalyticsDashboard() {
  const { status } = useSession();
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (tasks.length) return;

    let isCancelled = false;

    async function fetchTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }

        const data = (await response.json()) as ApiTask[];
        if (isCancelled) return;
        setTasks(data.map((task) => mapApiTask(task)));
      } catch (error) {
        console.error(error);
      }
    }

    fetchTasks();

    return () => {
      isCancelled = true;
    };
  }, [status, tasks.length, setTasks]);

  const now = new Date();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed || task.status === "completed").length;
  const overdueTasks = tasks.filter((task) => {
    if (task.completed || task.status === "completed") return false;
    const deadline = getDeadlineDate(task.deadline);
    return Boolean(deadline && isBefore(deadline, now));
  }).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      backlog: 0,
      in_progress: 0,
      in_review: 0,
      completed: 0
    };

    tasks.forEach((task) => {
      const key = task.completed || task.status === "completed" ? "completed" : task.status;
      counts[key] = (counts[key] ?? 0) + 1;
    });

    return Object.entries(counts).map(([status, value]) => ({ status, value }));
  }, [tasks]);

  const completionTrend = useMemo(() => {
    const weeks = Array.from({ length: 6 }).map((_, index) => {
      const start = startOfWeek(subWeeks(now, 5 - index), { weekStartsOn: 1 });
      const end = endOfWeek(start, { weekStartsOn: 1 });
      const weekLabel = `${format(start, "MMM d")}`;

      const count = tasks.filter((task) => {
        if (!(task.completed || task.status === "completed")) return false;
        const referenceDate = getDeadlineDate(task.deadline) ?? now;
        return isWithinInterval(referenceDate, { start, end });
      }).length;

      return {
        week: weekLabel,
        completed: count
      };
    });

    return weeks;
  }, [now, tasks]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      counts[task.category] = (counts[task.category] ?? 0) + 1;
    });

    return Object.entries(counts).map(([category, value], index) => ({
      category,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));
  }, [tasks]);

  const activeTasks = tasks.filter((task) => !task.completed && task.status !== "completed");
  const nextDeadline = useMemo(() => {
    const upcoming = activeTasks
      .map((task) => ({ task, deadline: getDeadlineDate(task.deadline) }))
      .filter((entry): entry is { task: typeof activeTasks[number]; deadline: Date } => Boolean(entry.deadline))
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    return upcoming.length ? upcoming[0] : null;
  }, [activeTasks]);

  const overdueRange = useMemo(() => {
    const overdue = activeTasks
      .map((task) => ({ task, deadline: getDeadlineDate(task.deadline) }))
      .filter((entry): entry is { task: typeof activeTasks[number]; deadline: Date } => Boolean(entry.deadline && isBefore(entry.deadline, now)));

    if (!overdue.length) return null;

    const oldest = overdue.reduce((prev, current) => (isAfter(prev.deadline, current.deadline) ? current : prev));
    return oldest.deadline;
  }, [activeTasks, now]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-16">
      <header className="border-b border-white/10 bg-white/40 backdrop-blur dark:bg-slate-900/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-10 text-slate-900 dark:text-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Visualize productivity trends and track progress across your workspace.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-3 py-1.5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
              <PieChartIcon className="h-4 w-4" />
              <span>{totalTasks} tasks tracked</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-8 px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Total tasks</span>
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{totalTasks}</p>
          </article>

          <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Completed</span>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{completedTasks}</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                {completionRate}% completion
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Overdue</span>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-3xl font-semibold text-rose-500 dark:text-rose-400">{overdueTasks}</p>
              {overdueRange ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Oldest overdue since {format(overdueRange, "MMM d")}
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">You're on track—no overdue tasks.</p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Next deadline</span>
            </div>
            {nextDeadline ? (
              <div className="mt-4 space-y-1">
                <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{format(nextDeadline.deadline, "MMM d")}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{nextDeadline.task.title}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">All caught up—no upcoming deadlines.</p>
            )}
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Task distribution</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Status mix across your entire workspace.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr,180px]">
              <div className="relative flex h-64 items-center justify-center">
                <ResponsiveContainer height={260}>
                  <PieChart>
                    <Pie data={statusDistribution} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={2}>
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#64748B"} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Completion</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{completionRate}%</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                {statusDistribution.map((entry) => (
                  <li key={entry.status} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[entry.status] ?? "#64748B" }}
                        aria-hidden
                      />
                      <span>{formatLabel(entry.status)}</span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{entry.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Completion trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Weekly volume of completed tasks.</p>
            </div>
            <div className="mt-6 h-64">
              <ResponsiveContainer height={260}>
                <LineChart data={completionTrend} xKey="week">
                  <Line dataKey="completed" stroke="#22C55E" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tasks by category</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Where effort is focused right now.</p>
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer height={300}>
              <BarChart data={categoryCounts} xKey="category">
                <Bar dataKey="value" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            {categoryCounts.map((entry) => (
              <div key={entry.category} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />
                <span>{formatLabel(entry.category)}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{entry.value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

