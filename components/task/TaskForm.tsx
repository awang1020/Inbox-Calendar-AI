"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { nanoid } from "nanoid";
import type { Tag, Task, TaskCategory, TaskPriority, TaskStatus } from "@/types/task";

interface TaskFormProps {
  task?: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Task) => void;
}

const categories: TaskCategory[] = ["work", "personal", "study", "wellness", "other"];
const priorities: TaskPriority[] = ["high", "medium", "low"];
const statuses: TaskStatus[] = ["backlog", "in_progress", "in_review", "completed"];

const defaultTags: Tag[] = [
  { id: "design", name: "Design" },
  { id: "frontend", name: "Frontend" },
  { id: "research", name: "Research" },
  { id: "planning", name: "Planning" },
  { id: "wellness", name: "Wellness" },
  { id: "personal", name: "Personal" }
];

const blankTask: Task = {
  id: "temp",
  title: "",
  description: "",
  category: "work",
  priority: "medium",
  deadline: "",
  status: "backlog",
  completed: false,
  tags: []
};

export function TaskForm({ task, open, onOpenChange, onSubmit }: TaskFormProps) {
  const [draft, setDraft] = useState<Task>(task ?? blankTask);
  const [availableTags, setAvailableTags] = useState<Tag[]>(() => defaultTags);
  const [tagQuery, setTagQuery] = useState("");

  useEffect(() => {
    setDraft(task ?? blankTask);
    setTagQuery("");
    if (task?.tags?.length) {
      setAvailableTags((prev) => {
        const map = new Map(prev.map((tag) => [tag.id, tag]));
        task.tags.forEach((tag) => {
          if (!map.has(tag.id)) {
            map.set(tag.id, tag);
          }
        });
        return Array.from(map.values());
      });
    }
  }, [task]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      ...draft,
      completed: draft.status === "completed"
    });
  }

  function updateDraft<K extends keyof Task>(key: K, value: Task[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleCommitTag(rawValue: string) {
    const name = rawValue.trim();
    if (!name) return;

    const normalizedName = name.replace(/\s+/g, " ");
    let resolved = availableTags.find((existing) => existing.name.toLowerCase() === normalizedName.toLowerCase());

    if (!resolved) {
      const newTag: Tag = { id: nanoid(), name: normalizedName };
      resolved = newTag;
      setAvailableTags((prev) => [...prev, newTag]);
    }

    if (!draft.tags.some((existing) => existing.id === resolved.id)) {
      updateDraft("tags", [...draft.tags, resolved]);
    }

    setTagQuery("");
  }

  function removeTag(id: string) {
    updateDraft("tags", draft.tags.filter((tag) => tag.id !== id));
  }

  const filteredTagOptions = useMemo(
    () =>
      availableTags.filter(
        (tag) =>
          !draft.tags.some((selected) => selected.id === tag.id) &&
          tag.name.toLowerCase().includes(tagQuery.toLowerCase())
      ),
    [availableTags, draft.tags, tagQuery]
  );

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`absolute inset-x-4 top-20 mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 ${open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}
      >
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {task ? "Update task" : "Create a new task"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Provide details to keep track of your progress.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] dark:border-slate-700 dark:text-slate-300"
            aria-label="Close form"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</span>
            <input
              required
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              placeholder="Design the next sprint"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
              rows={3}
              placeholder="Outline deliverables, owners, and expectations."
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</span>
              <select
                value={draft.category}
                onChange={(event) => updateDraft("category", event.target.value as TaskCategory)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Priority</span>
              <select
                value={draft.priority}
                onChange={(event) => updateDraft("priority", event.target.value as TaskPriority)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Deadline</span>
              <input
                type="datetime-local"
                value={draft.deadline ? draft.deadline.slice(0, 16) : ""}
                onChange={(event) => updateDraft("deadline", event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</span>
              <select
                value={draft.status}
                onChange={(event) => updateDraft("status", event.target.value as TaskStatus)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status
                      .split("_")
                      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Tags</span>
            {draft.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {draft.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="rounded-full p-0.5 text-slate-400 transition hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] dark:text-slate-400 dark:hover:text-slate-200"
                      aria-label={`Remove ${tag.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div>
              <input
                type="text"
                list="task-form-tag-options"
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (["Enter", "Tab", ","].includes(event.key)) {
                    const value = event.currentTarget.value;
                    if (value.trim()) {
                      event.preventDefault();
                      handleCommitTag(value);
                    } else if (event.key !== "Tab") {
                      event.preventDefault();
                    }
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[hsl(var(--accent))] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <datalist id="task-form-tag-options">
                {filteredTagOptions.map((tag) => (
                  <option key={tag.id} value={tag.name} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Type to search existing tags or create a new one.</p>
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={draft.completed}
              onChange={(event) => updateDraft("completed", event.target.checked)}
              className="h-4 w-4 rounded border border-slate-300 text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
            />
            Mark as completed
          </label>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
            >
              {task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
