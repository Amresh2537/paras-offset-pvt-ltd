export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of Paras Offset production, dispatch and inventory.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs font-medium text-slate-400">
            Open Job Cards
          </p>
          <p className="text-2xl font-semibold text-emerald-400">—</p>
          <p className="text-[11px] text-slate-500">
            Coming soon: live job card counts by status.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs font-medium text-slate-400">
            Today&apos;s Dispatches
          </p>
          <p className="text-2xl font-semibold text-emerald-400">—</p>
          <p className="text-[11px] text-slate-500">
            Coming soon: dispatched quantity and status summary.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs font-medium text-slate-400">
            Low Stock Materials
          </p>
          <p className="text-2xl font-semibold text-emerald-400">—</p>
          <p className="text-[11px] text-slate-500">
            Coming soon: materials approaching reorder levels.
          </p>
        </div>
      </div>
    </div>
  );
}

