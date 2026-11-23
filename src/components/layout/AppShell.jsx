import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { HiMenu, HiMoon, HiOutlineChartPie, HiOutlineCog, HiOutlineShoppingBag, HiOutlineUsers, HiSun } from "react-icons/hi";
import { useSettings } from "../../context/SettingsContext";

const NAV = [
  { to: "/", label: "Overview", icon: HiOutlineChartPie, end: true },
  { to: "/orders", label: "Orders", icon: HiOutlineShoppingBag },
  { to: "/customers", label: "Customers", icon: HiOutlineUsers },
  { to: "/settings", label: "Settings", icon: HiOutlineCog },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { storeName, isDark, setTheme } = useSettings();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const title = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.label ?? "Orbit";

  return (
    <div className="min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 px-6 text-xl font-extrabold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">O</span>
          Orbit
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon className="text-xl" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="m-4 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <p className="muted text-xs">Store</p>
          <p className="truncate font-bold">{storeName}</p>
          <p className="muted mt-1 text-xs">Demo data, regenerated each load</p>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:px-8">
          <button className="text-2xl lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <HiMenu />
          </button>
          <h1 className="text-lg font-bold">{title}</h1>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <HiSun /> : <HiMoon />}
          </button>
        </header>

        <main className="mx-auto max-w-7xl p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
