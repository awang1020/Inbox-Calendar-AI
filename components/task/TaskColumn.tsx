import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";

interface ColumnMeta {
  status: TaskStatus;
  title: string;
  description: string;
}

interface TaskColumnProps {
  column: ColumnMeta;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, updates: Partial<Task>) => void;
  onOpenSubtasks: (task: Task) => void;
}

const statusAccent: Record<TaskStatus, string> = {
  backlog: "from-blue-400/40 to-blue-500/30",
  in_progress: "from-purple-400/40 to-purple-500/30",
  in_review: "from-amber-400/30 to-amber-500/30",
  completed: "from-emerald-400/30 to-emerald-500/30"
};

export function TaskColumn({ column, tasks, onEdit, onDelete, onStatusChange, onOpenSubtasks }: TaskColumnProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/50">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{column.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{column.description}</p>
        </div>
        <div className={`hidden h-10 w-10 rounded-full bg-gradient-to-br ${statusAccent[column.status]} md:block`} />
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onOpenSubtasks={onOpenSubtasks}
          />
        ))}

        {!tasks.length && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300/70 p-6 text-center text-xs text-slate-400 dark:border-slate-700/70 dark:text-slate-500">
            Nothing here yet.
          </div>
        )}
      </div>
    </article>
  );
}
