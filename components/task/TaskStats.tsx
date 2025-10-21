import { CheckCircle, Clock, Inbox, ListTodo } from "lucide-react";
import type { Task } from "@/types/task";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed" || task.completed).length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const backlog = tasks.filter((task) => task.status === "backlog").length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Total tasks</span>
          <Inbox className="h-4 w-4" />
        </div>
        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{total}</p>
      </article>

      <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>In progress</span>
          <Clock className="h-4 w-4" />
        </div>
        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{inProgress}</p>
      </article>

      <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Backlog</span>
          <ListTodo className="h-4 w-4" />
        </div>
        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{backlog}</p>
      </article>

      <article className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Completion</span>
          <CheckCircle className="h-4 w-4" />
        </div>
        <div className="mt-3">
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{completionRate}%</p>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </article>
    </section>
  );
}
