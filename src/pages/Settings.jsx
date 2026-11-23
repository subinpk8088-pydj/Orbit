import { useSettings } from "../context/SettingsContext";

const THEMES = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["system", "System"],
];

function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="muted text-sm">{hint}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme, storeName, setStoreName, notifications, setNotifications } = useSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <section className="card p-6">
        <h2 className="font-bold">Appearance</h2>
        <p className="muted mt-1 text-sm">Choose how Orbit looks. System follows your device setting.</p>
        <div className="mt-4 inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800" role="radiogroup" aria-label="Theme">
          {THEMES.map(([val, label]) => (
            <button
              key={val}
              role="radio"
              aria-checked={theme === val}
              onClick={() => setTheme(val)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${theme === val ? "bg-white shadow-sm dark:bg-slate-700" : "muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-bold">Store</h2>
        <label htmlFor="store-name" className="muted mb-1.5 mt-4 block text-sm font-medium">Store name</label>
        <input id="store-name" className="input" value={storeName} maxLength={30} onChange={(e) => setStoreName(e.target.value)} />
        <p className="muted mt-2 text-xs">Shown in the sidebar. Saved automatically in this browser.</p>
      </section>

      <section className="card divide-y divide-slate-100 px-6 py-3 dark:divide-slate-800">
        <h2 className="py-3 font-bold">Notifications</h2>
        <Toggle label="New order alerts" hint="Get notified when an order is placed." checked={notifications.newOrder} onChange={(v) => setNotifications((n) => ({ ...n, newOrder: v }))} />
        <Toggle label="Weekly summary" hint="A Monday email with last week's numbers." checked={notifications.weekly} onChange={(v) => setNotifications((n) => ({ ...n, weekly: v }))} />
      </section>
      <p className="muted text-xs">Notification toggles are stored locally for this demo and don't send anything.</p>
    </div>
  );
}
