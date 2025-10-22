import { CalendarClock, Check, PencilLine, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TodayTaskCardProps {
  task: Task;
  deadline: Date | null;
  isOverdue?: boolean;
  currentDate: Date;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const priorityStyles: Record<Task["priority"], string> = {
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
};

export function TodayTaskCard({
  task,
  deadline,
  isOverdue = false,
  currentDate,
  onEdit,
  onDelete,
  onComplete
}: TodayTaskCardProps) {
  const dueLabel = deadline
    ? isSameDay(deadline, currentDate)
      ? format(deadline, "h:mm a")
      : format(deadline, "MMM d • h:mm a")
    : "Anytime";

  const categoryLabel = task.category.charAt(0).toUpperCase() + task.category.slice(1);

  return (
    <article className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/60">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {categoryLabel}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                priorityStyles[task.priority]
              )}
            >
              {task.priority}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
          )}
        </div>

        <button
          onClick={() => onComplete(task.id)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/40 text-emerald-600 transition hover:bg-emerald-500/10 hover:text-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-emerald-400/40 dark:text-emerald-300 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-200"
          aria-label="Mark task as completed"
        >
          <Check className="h-4 w-4" />
        </button>
      </header>

      <footer className="mt-auto flex items-center justify-between gap-3 text-sm">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300",
            isOverdue && "border-rose-400/60 bg-rose-500/10 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300"
          )}
        >
          <CalendarClock className="h-4 w-4" />
          <span className="font-medium">{dueLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:scale-[1.03] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] dark:border-slate-700 dark:text-slate-300"
            aria-label="Edit task"
          >
            <PencilLine className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:scale-[1.03] hover:border-rose-500 hover:text-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:text-slate-300"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </article>
  );
}
