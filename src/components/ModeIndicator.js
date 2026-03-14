export default function ModeIndicator({ mode = "new", jobCardNo = "" }) {
  const isEdit = mode === "edit";

  return (
    <div
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ring-1 ${
        isEdit
          ? "bg-amber-500/10 text-amber-200 ring-amber-500/40"
          : "bg-sky-500/10 text-sky-200 ring-sky-500/40"
      }`}
    >
      {isEdit ? `Edit Mode${jobCardNo ? `: ${jobCardNo}` : ""}` : "New Mode"}
    </div>
  );
}
