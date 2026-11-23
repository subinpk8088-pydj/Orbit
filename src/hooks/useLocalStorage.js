import { useEffect, useState } from "react";

/** useState that persists JSON to localStorage and falls back safely if storage is unavailable or corrupted. */
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      if (typeof window === "undefined") return initial;
      const raw = window.localStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable: value just won't persist
    }
  }, [key, value]);

  return [value, setValue];
}
