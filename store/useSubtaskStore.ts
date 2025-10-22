"use client";

import { create } from "zustand";
import type { Subtask } from "@/types/task";

type SubtaskDictionary = Record<string, Subtask[]>;

interface SubtaskState {
  subtasks: SubtaskDictionary;
  loading: Record<string, boolean>;
  loaded: Record<string, boolean>;
  fetchSubtasks: (taskId: string, force?: boolean) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleDone: (taskId: string, subtaskId: string, done: boolean) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  reorderSubtasks: (taskId: string, orderedIds: string[]) => Promise<void>;
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return (await response.json()) as T;
}

export const useSubtaskStore = create<SubtaskState>((set, get) => ({
  subtasks: {},
  loading: {},
  loaded: {},
  async fetchSubtasks(taskId, force = false) {
    const { loaded } = get();
    if (loaded[taskId] && !force) return;

    set((state) => ({ loading: { ...state.loading, [taskId]: true } }));
    try {
      const data = await request<{ subtasks: Subtask[] }>(`/api/tasks/${taskId}/subtasks`);
      set((state) => ({
        subtasks: { ...state.subtasks, [taskId]: data.subtasks },
        loading: { ...state.loading, [taskId]: false },
        loaded: { ...state.loaded, [taskId]: true }
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({ loading: { ...state.loading, [taskId]: false } }));
    }
  },
  async addSubtask(taskId, title) {
    const trimmed = title.trim();
    if (!trimmed) return;

    const optimistic: Subtask = {
      id: `temp-${Date.now()}`,
      taskId,
      title: trimmed,
      done: false,
      order: get().subtasks[taskId]?.length ?? 0
    };

    const previous = get().subtasks[taskId] ?? [];
    set((state) => ({
      subtasks: { ...state.subtasks, [taskId]: [...previous, optimistic] },
      loaded: { ...state.loaded, [taskId]: true }
    }));

    try {
      const created = await request<Subtask>(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed })
      });

      set((state) => ({
        subtasks: {
          ...state.subtasks,
          [taskId]: (state.subtasks[taskId] ?? [])
            .map((subtask) => (subtask.id === optimistic.id ? created : subtask))
            .sort((a, b) => a.order - b.order)
        }
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({
        subtasks: {
          ...state.subtasks,
          [taskId]: previous
        }
      }));
    }
  },
  async toggleDone(taskId, subtaskId, done) {
    const subtasks = get().subtasks[taskId] ?? [];
    const previous = subtasks.map((subtask) => ({ ...subtask }));
    set((state) => ({
      subtasks: {
        ...state.subtasks,
        [taskId]: subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, done } : subtask
        )
      }
    }));

    try {
      await request<Subtask>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done })
      });
    } catch (error) {
      console.error(error);
      set((state) => ({
        subtasks: { ...state.subtasks, [taskId]: previous }
      }));
    }
  },
  async deleteSubtask(taskId, subtaskId) {
    const previous = get().subtasks[taskId] ?? [];
    set((state) => ({
      subtasks: {
        ...state.subtasks,
        [taskId]: previous.filter((subtask) => subtask.id !== subtaskId)
      }
    }));

    try {
      const data = await request<{ subtasks: Subtask[] }>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "DELETE"
      });
      set((state) => ({
        subtasks: { ...state.subtasks, [taskId]: data.subtasks }
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({ subtasks: { ...state.subtasks, [taskId]: previous } }));
    }
  },
  async reorderSubtasks(taskId, orderedIds) {
    const subtasks = get().subtasks[taskId] ?? [];
    const orderMap = new Map(orderedIds.map((id, index) => [id, index] as const));
    const reordered = [...subtasks]
      .map((subtask) => ({
        ...subtask,
        order: orderMap.has(subtask.id) ? (orderMap.get(subtask.id) ?? subtask.order) : subtask.order
      }))
      .sort((a, b) => a.order - b.order);

    set((state) => ({
      subtasks: { ...state.subtasks, [taskId]: reordered }
    }));

    try {
      const data = await request<{ subtasks: Subtask[] }>(`/api/tasks/${taskId}/subtasks/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderedIds })
      });
      set((state) => ({
        subtasks: { ...state.subtasks, [taskId]: data.subtasks }
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({
        subtasks: { ...state.subtasks, [taskId]: subtasks }
      }));
    }
  }
}));
