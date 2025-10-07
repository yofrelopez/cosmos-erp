"use client";

import { useCallback, useEffect, useState } from "react";

export function useGlassItemsLocalStorage<T = unknown>(
  key: string = "quoteItems",
  initial: T[] = []
) {
  const [items, setItems] = useState<T[]>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : initial;
      return Array.isArray(parsed) ? (parsed as T[]) : initial;
    } catch {
      return initial;
    }
  });

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  }, [items, key, hydrated]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setItems([]);
  }, [key]);

  return { items, setItems, clear, hydrated } as const;
}
