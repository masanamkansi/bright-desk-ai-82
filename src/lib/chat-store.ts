import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";

const THREADS_KEY = "wpa:chat:threads";
const MESSAGES_PREFIX = "wpa:chat:messages:";

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: number;
}

export function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatThread[]) : [];
  } catch {
    return [];
  }
}

function writeThreads(threads: ChatThread[]) {
  window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("wpa:threads-changed"));
}

export function readMessages(threadId: string): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MESSAGES_PREFIX + threadId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function writeMessages(threadId: string, messages: UIMessage[]) {
  window.localStorage.setItem(MESSAGES_PREFIX + threadId, JSON.stringify(messages));
}

export function createThread(title = "New conversation"): ChatThread {
  const thread: ChatThread = {
    id: crypto.randomUUID(),
    title,
    updatedAt: Date.now(),
  };
  const threads = readThreads();
  writeThreads([thread, ...threads]);
  return thread;
}

export function deleteThread(id: string) {
  const next = readThreads().filter((t) => t.id !== id);
  writeThreads(next);
  if (typeof window !== "undefined") window.localStorage.removeItem(MESSAGES_PREFIX + id);
}

export function updateThread(id: string, patch: Partial<Pick<ChatThread, "title" | "updatedAt">>) {
  const threads = readThreads();
  const idx = threads.findIndex((t) => t.id === id);
  if (idx === -1) return;
  threads[idx] = { ...threads[idx], ...patch, updatedAt: patch.updatedAt ?? Date.now() };
  threads.sort((a, b) => b.updatedAt - a.updatedAt);
  writeThreads(threads);
}

export function useThreads() {
  const [threads, setThreads] = useState<ChatThread[]>(() => readThreads());

  useEffect(() => {
    const sync = () => setThreads(readThreads());
    window.addEventListener("storage", sync);
    window.addEventListener("wpa:threads-changed", sync);
    sync();
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wpa:threads-changed", sync);
    };
  }, []);

  const refresh = useCallback(() => setThreads(readThreads()), []);
  return { threads, refresh };
}

export function clearAllChats() {
  if (typeof window === "undefined") return;
  const threads = readThreads();
  for (const t of threads) window.localStorage.removeItem(MESSAGES_PREFIX + t.id);
  window.localStorage.removeItem(THREADS_KEY);
  window.dispatchEvent(new Event("wpa:threads-changed"));
}
