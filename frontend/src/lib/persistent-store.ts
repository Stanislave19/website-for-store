"use client";

import { useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  for (const listener of listeners.get(key) ?? []) listener();
}

function subscribe(key: string, callback: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)?.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) callback();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.get(key)?.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function usePersistentStore<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    () => readStore(key, fallback),
    () => fallback,
  );

  const setValue = (updater: T | ((current: T) => T)) => {
    const current = readStore(key, fallback);
    const next = typeof updater === "function" ? (updater as (current: T) => T)(current) : updater;
    writeStore(key, next);
  };

  return [value, setValue] as const;
}
