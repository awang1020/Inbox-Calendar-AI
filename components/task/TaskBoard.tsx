import { KanbanSquare } from "lucide-react";
import type { Task, TaskStatus } from "@/types/task";
import { TaskColumn } from "./TaskColumn";

interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, updates: Partial<Task>) => void;
}

const columns: { status: TaskStatus; title: string; description: string }[] = [
  {
    status: "backlog",
    title: "Backlog",
    description: "Ideas, someday tasks, or anything waiting for kickoff."
  },
  {
    status: "in_progress",
    title: "In Progress",
    description: "Things that currently have your focus."
  },
  {
    status: "in_review",
    title: "In Review",
    description: "Tasks pending feedback or validation."
  },
  {
    status: "completed",
    title: "Completed",
    description: "Celebrate your wins and close the loop."
  }
];

export function TaskBoard({ tasks, onEdit, onDelete, onStatusChange }: TaskBoardProps) {
  if (!tasks.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-16 text-center shadow-inner dark:border-slate-700/70 dark:bg-slate-900/40">
        <KanbanSquare className="h-8 w-8 text-slate-400" />
        <div>
          <p className="text-lg font-medium text-slate-700 dark:text-slate-200">No tasks found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adjust filters or add a new task to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="grid flex-1 gap-4 pb-10 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => (
        <TaskColumn
          key={column.status}
          column={column}
          tasks={tasks.filter((task) => task.status === column.status)}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </section>
  );
}
