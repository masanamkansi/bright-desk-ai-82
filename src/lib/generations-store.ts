import { useCallback, useEffect, useSyncExternalStore } from "react";

const KEY = "wpa:generations";

export type GenerationType = "email" | "summary" | "plan" | "research";

export interface Generation {
  id: string;
  type: GenerationType;
  title: string;
  output: string;
  createdAt: number;
}

function read(): Generation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Generation[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
  // also notify other tabs via storage event already handled by browser
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function useGenerations() {
  const items = useSyncExternalStore(subscribe, read, () => [] as Generation[]);

  const save = useCallback((g: Omit<Generation, "id" | "createdAt">) => {
    const entry: Generation = {
      ...g,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const next = [entry, ...read()].slice(0, 500);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    emit();
    return entry;
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(KEY);
    emit();
  }, []);

  return { items, save, clear };
}

export function useCounts() {
  const { items } = useGenerations();
  return {
    email: items.filter((i) => i.type === "email").length,
    summary: items.filter((i) => i.type === "summary").length,
    plan: items.filter((i) => i.type === "plan").length,
    research: items.filter((i) => i.type === "research").length,
    total: items.length,
  };
}

/** No-op hook to keep imports tidy where we only want to ensure storage exists. */
export function useGenerationsReady() {
  useEffect(() => {
    /* noop */
  }, []);
}
