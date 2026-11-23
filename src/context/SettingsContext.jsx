import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("orbit_theme", "system"); // light | dark | system
  const [storeName, setStoreName] = useLocalStorage("orbit_store", "Northwind Goods");
  const [notifications, setNotifications] = useLocalStorage("orbit_notifs", { newOrder: true, weekly: false });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, isDark, storeName, setStoreName, notifications, setNotifications }),
    [theme, setTheme, isDark, storeName, setStoreName, notifications, setNotifications]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
