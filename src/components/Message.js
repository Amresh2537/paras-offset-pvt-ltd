export default function Message({ type = "info", text = "" }) {
  if (!text) return null;

  const styles = {
    success: "border-emerald-500/40 bg-emerald-950/40 text-emerald-100",
    error: "border-red-500/40 bg-red-950/40 text-red-100",
    info: "border-slate-700 bg-slate-900 text-slate-100",
  };

  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${styles[type] || styles.info}`}>
      {text}
    </div>
  );
}
