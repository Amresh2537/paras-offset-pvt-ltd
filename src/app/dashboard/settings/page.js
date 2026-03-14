"use client";

import { useEffect, useState } from "react";

const dropdownFields = [
  ["clientNames", "Client Names"],
  ["categories", "Categories"],
  ["bindingTypes", "Binding Types"],
  ["paperTypes", "Paper Types"],
  ["paperMills", "Paper Mills"],
  ["forWhatOptions", "For What Options"],
  ["printingMachines", "Printing Machines"],
  ["operationMachines", "Operation Machines"],
  ["jobOperations", "Job Operations"],
  ["itemNames", "Item Names"],
  ["paperBoardNames", "Paper/Board Names"],
  ["gradeBrands", "Grade/Brands"],
  ["jobNames", "Job Names"],
];

export default function SettingsPage() {
  const [dropdowns, setDropdowns] = useState({});
  const [field, setField] = useState("clientNames");
  const [valueText, setValueText] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadDropdowns() {
    const res = await fetch("/api/dropdowns", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setDropdowns(data.dropdowns || {});
    }
  }

  useEffect(() => {
    void loadDropdowns();
  }, []);

  function parseValues(text) {
    return text
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function handleAdd(event) {
    event.preventDefault();
    const values = parseValues(valueText);
    if (values.length === 0) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/dropdowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, values }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add dropdown value");
      }
      setValueText("");
      setMessage(data.message || "Dropdown updated successfully.");
      await loadDropdowns();
    } catch (error) {
      setMessage(error.message || "Failed to update dropdown.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Update all dropdown options used in Job Card form.</p>
      </div>

      {message && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
          {message}
        </div>
      )}

      <form onSubmit={handleAdd} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
          <div className="space-y-1">
            <label className="text-xs text-slate-600">Dropdown</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
            >
              {dropdownFields.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-600">New Values</label>
            <textarea
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              rows={3}
              placeholder="Enter multiple values (comma or new line separated)"
            />
            <p className="text-[11px] text-slate-500">
              Example: Offset\nScreen\nDigital or Offset, Screen, Digital
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="self-end rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {saving ? "Adding..." : "Add All"}
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {dropdownFields.map(([key, label]) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {(dropdowns[key] || []).length === 0 && (
                <span className="text-xs text-slate-500">No values</span>
              )}
              {(dropdowns[key] || []).map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
