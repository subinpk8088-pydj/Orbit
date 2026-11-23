export default function Pagination({ page, pageSize, total, onChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // show a window of up to 5 page numbers around the current page
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);

  const btn = "h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition disabled:opacity-40";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:flex-row dark:border-slate-800">
      <p className="muted">
        Showing {from}–{to} of {total}
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button className={`${btn} hover:bg-slate-100 dark:hover:bg-slate-800`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "bg-brand-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            {p}
          </button>
        ))}
        <button className={`${btn} hover:bg-slate-100 dark:hover:bg-slate-800`} disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </nav>
    </div>
  );
}
