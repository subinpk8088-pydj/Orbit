export default function EmptyState({ title, text }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-semibold">{title}</p>
      {text && <p className="muted mt-1 text-sm">{text}</p>}
    </div>
  );
}
