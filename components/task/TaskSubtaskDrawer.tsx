"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, GripVertical, Plus, Trash2, X } from "lucide-react";
import type { Task } from "@/types/task";
import { useSubtaskStore } from "@/store/useSubtaskStore";

interface TaskSubtaskDrawerProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskSubtaskDrawer({ task, open, onOpenChange }: TaskSubtaskDrawerProps) {
  const taskId = task?.id;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const subtasks = useSubtaskStore((state) => (taskId ? state.subtasks[taskId] ?? [] : []));
  const loading = useSubtaskStore((state) => (taskId ? state.loading[taskId] ?? false : false));
  const fetchSubtasks = useSubtaskStore((state) => state.fetchSubtasks);
  const addSubtask = useSubtaskStore((state) => state.addSubtask);
  const toggleDone = useSubtaskStore((state) => state.toggleDone);
  const deleteSubtask = useSubtaskStore((state) => state.deleteSubtask);
  const reorderSubtasks = useSubtaskStore((state) => state.reorderSubtasks);

  const completed = useMemo(() => subtasks.filter((subtask) => subtask.done).length, [subtasks]);

  useEffect(() => {
    if (!taskId || !open) return;
    fetchSubtasks(taskId).catch((error) => console.error(error));
  }, [open, taskId, fetchSubtasks]);

  useEffect(() => {
    if (!open) {
      setNewTitle("");
      setDraggingId(null);
    }
  }, [open]);

  if (!task) return null;

  function handleAddSubtask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskId) return;
    const title = newTitle;
    setNewTitle("");
    void addSubtask(taskId, title);
  }

  function handleDrop(targetId: string) {
    if (!taskId || !draggingId || draggingId === targetId) return;
    const ids = reorderIds(subtasks, draggingId, targetId);
    if (!ids) return;
    void reorderSubtasks(taskId, ids);
  }

  function handleDragOver(event: React.DragEvent<HTMLLIElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => onOpenChange(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute bottom-0 left-0 right-0 ml-auto h-[85vh] w-full max-w-lg rounded-t-3xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 md:right-6 md:top-20 md:h-[75vh] md:max-w-xl md:rounded-3xl ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Subtasks</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{task.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track progress by checking off subtasks. Drag to reorder.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] dark:border-slate-700 dark:text-slate-300"
            aria-label="Close subtask drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex h-[calc(100%-4.75rem)] flex-col">
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="relative flex-1">
              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Add a subtask"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Plus className="h-4 w-4" />
              </span>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            >
              Add
            </button>
          </form>

          <section className="flex-1 overflow-y-auto px-2 py-4">
            {loading && subtasks.length === 0 ? (
              <p className="px-4 text-sm text-slate-500 dark:text-slate-400">Loading subtasks…</p>
            ) : subtasks.length === 0 ? (
              <p className="px-4 text-sm text-slate-500 dark:text-slate-400">No subtasks yet. Start by adding one above.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {subtasks.map((subtask) => (
                  <li
                    key={subtask.id}
                    draggable
                    onDragStart={() => setDraggingId(subtask.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(subtask.id)}
                    className={`group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition dark:border-slate-700 dark:bg-slate-950 ${draggingId === subtask.id ? "opacity-50" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (taskId) void toggleDone(taskId, subtask.id, !subtask.done);
                      }}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] ${subtask.done ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900"}`}
                      aria-label={subtask.done ? "Mark subtask incomplete" : "Mark subtask complete"}
                    >
                      {subtask.done && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${subtask.done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-100"}`}>
                        {subtask.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (taskId) void deleteSubtask(taskId, subtask.id);
                      }}
                      className="opacity-0 transition group-hover:opacity-100"
                      aria-label="Delete subtask"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </button>
                    <GripVertical className="h-4 w-4 text-slate-300" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {completed}/{subtasks.length} completed
          </footer>
        </div>
      </aside>
    </div>
  );
}

function reorderIds(subtasks: { id: string }[], sourceId: string, targetId: string) {
  const ids = subtasks.map((subtask) => subtask.id);
  const fromIndex = ids.indexOf(sourceId);
  const toIndex = ids.indexOf(targetId);
  if (fromIndex === -1 || toIndex === -1) return null;

  const next = [...ids];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, sourceId);
  return next;
}
