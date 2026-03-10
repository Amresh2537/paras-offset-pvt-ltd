"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [jobCardNo, setJobCardNo] = useState("");
  const [basic, setBasic] = useState({ jobType: "", date: "" });

  useEffect(() => {
    void loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobcard-numbers");
      if (res.ok) {
        const data = await res.json();
        setJobCardNo(data.nextJobCardNo || "");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load job card number.");
    } finally {
      setLoading(false);
    }
  }

  function handleBasicChange(e) {
    const { name, value } = e.target;
    setBasic((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        jobCardNo: jobCardNo || undefined,
        jobType: basic.jobType || undefined,
        date: basic.date ? new Date(basic.date).toISOString() : undefined,
      };

      const res = await fetch("/api/jobcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create job card");

      setMessage("Job card created successfully.");
      router.push("/dashboard/jobcards");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save job card.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            New Job Card
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create a new job card and save to MongoDB.
          </p>
        </div>
        <button
          type="button"
          onClick={loadInitial}
          disabled={loading}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh number"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-100">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6"
      >
        <div className="grid gap-3 md:grid-cols-3 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-300">JOB CARD NO</label>
            <input
              type="text"
              value={jobCardNo}
              onChange={(e) => setJobCardNo(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-slate-300">JOB TYPE</label>
            <select
              name="jobType"
              value={basic.jobType}
              onChange={handleBasicChange}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100"
            >
              <option value="">Select</option>
              <option value="NEW">NEW</option>
              <option value="OLD">OLD</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-slate-300">DATE</label>
            <input
              type="date"
              name="date"
              value={basic.date}
              onChange={handleBasicChange}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/jobcards")}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-500 px-4 py-1.5 text-xs font-medium text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Job Card"}
          </button>
        </div>
      </form>
    </div>
  );
}

