const STYLES = {
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  shipped: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  processing: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status] ?? ""}`}>{status}</span>
  );
}
