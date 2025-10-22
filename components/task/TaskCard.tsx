import { FlagTriangleRight, PencilLine, Trash2 } from "lucide-react";
import { formatDistanceToNow, isBefore, startOfToday } from "date-fns";
import type { Task, TaskPriority } from "@/types/task";
import { cn, formatDeadline } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, updates: Partial<Task>) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const parsedDeadline = task.deadline ? new Date(task.deadline) : null;
  const validDeadline = parsedDeadline && !Number.isNaN(parsedDeadline.valueOf()) ? parsedDeadline : null;
  const deadlineDistance = validDeadline
    ? formatDistanceToNow(validDeadline, { addSuffix: true })
    : "Flexible";
  const isOverdue = validDeadline ? isBefore(validDeadline, startOfToday()) : false;

  return (
    <article className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{task.title}</h3>
          {task.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.description}</p>}
        </div>
        <span className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium", priorityStyles[task.priority])}>
          <FlagTriangleRight className="h-3 w-3" />
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {task.category}
        </span>
        <span className={cn(isOverdue && "font-semibold text-rose-600 dark:text-rose-400")}>
          {formatDeadline(task.deadline)}
        </span>
        <span className="ml-auto text-emerald-600 dark:text-emerald-400">{deadlineDistance}</span>
      </div>

      <footer className="mt-4 flex items-center justify-between gap-3">
        <select
          value={task.status}
          onChange={(event) => onStatusChange(task.id, { status: event.target.value as Task["status"] })}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="backlog">Backlog</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] dark:border-slate-700 dark:text-slate-300"
            aria-label="Edit task"
          >
            <PencilLine className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-500 hover:text-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-slate-700 dark:text-slate-300"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </article>
  );
}
