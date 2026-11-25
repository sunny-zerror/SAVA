import { useSyncExternalStore } from "react";

/*
 * A localStorage-backed value shared by every component that reads it, kept in sync across tabs.
 * The server render (and the first client render) see `fallback`, so the markup always matches.
 */
export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cache: T | undefined;

  const read = (): T => {
    if (cache === undefined) {
      try {
        const raw = localStorage.getItem(key);
        cache = raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        cache = fallback;
      }
    }
    return cache;
  };

  const write = (update: (previous: T) => T) => {
    cache = update(read());
    try {
      localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      // Storage unavailable: the value lives for this visit only
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    // Another tab changed it
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      cache = undefined;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  // Declared out here, not inline in useValue: the React Compiler treats a hook's free variables
  // as module-level, so an inline `() => fallback` would lose `fallback`
  const serverSnapshot = () => fallback;
  const useValue = () => useSyncExternalStore(subscribe, read, serverSnapshot);

  return { read, write, subscribe, useValue };
}
