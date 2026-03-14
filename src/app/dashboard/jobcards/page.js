"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function JobCardsListPage() {
  const [loading, setLoading] = useState(true);
  const [jobCards, setJobCards] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobcards", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load job cards");
      }
      setJobCards(data.jobCards || []);
    } catch (err) {
      setError(err.message || "Failed to load job cards");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this job card?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/jobcards/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete job card");
      }
      setJobCards((prev) => prev.filter((jobCard) => String(jobCard._id) !== id));
    } catch (err) {
      setError(err.message || "Failed to delete job card");
    }
  }

  const query = search.trim().toLowerCase();
  const filteredJobCards = jobCards.filter((jc) => {
    if (!query) return true;
    return [jc.jobCardNo, jc.clientName, jc.category, jc.jobType]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const totalCount = jobCards.length;
  const newCount = jobCards.filter((jc) => String(jc.jobType || "").toUpperCase() === "NEW").length;
  const repeatCount = jobCards.filter((jc) => String(jc.jobType || "").toUpperCase() === "REPEAT").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Job Cards
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View recently created job cards and open create/edit forms.
          </p>
        </div>
        <Link
          href="/dashboard/jobcards/new"
          className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
        >
          + New Job Card
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Total Job Cards</p>
          <p className="mt-1 text-xl font-semibold text-slate-100">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/30 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-emerald-300">New Jobs</p>
          <p className="mt-1 text-xl font-semibold text-emerald-100">{newCount}</p>
        </div>
        <div className="rounded-xl border border-amber-700/40 bg-amber-950/30 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-amber-300">Repeat Jobs</p>
          <p className="mt-1 text-xl font-semibold text-amber-100">{repeatCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Job Card No, Client, Category, Job Type"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      <div className="space-y-3 md:hidden">
        {!loading && filteredJobCards.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-5 text-center text-xs text-slate-500">
            No job cards found.
          </div>
        )}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-5 text-center text-xs text-slate-500">
            Loading job cards...
          </div>
        )}
        {filteredJobCards.map((jc) => (
          <div key={jc._id.toString()} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{jc.jobCardNo}</p>
                <p className="text-xs text-slate-400">{jc.clientName || "-"}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{jc.jobType || "-"}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Category: {jc.category || "-"}</p>
            <p className="text-[11px] text-slate-500">
              Created: {jc.createdAt ? new Date(jc.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "-"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href={`/dashboard/jobcards/${jc._id.toString()}`} className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-200 hover:border-slate-500">Edit</Link>
              <a href={jc.pdfUrl || `/api/pdf/${jc._id.toString()}`} target="_blank" rel="noreferrer" className="rounded border border-sky-500/50 px-2 py-1 text-[10px] text-sky-200 hover:border-sky-400">View PDF</a>
              <button type="button" onClick={() => handleDelete(jc._id.toString())} className="rounded border border-red-500/50 px-2 py-1 text-[10px] text-red-200 hover:border-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40 md:block">
        <table className="min-w-full text-[11px] text-slate-200">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Job Card No</th>
              <th className="px-3 py-2 text-left font-medium">Client</th>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-left font-medium">Job Type</th>
              <th className="px-3 py-2 text-left font-medium">Created</th>
              <th className="px-3 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredJobCards.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-slate-500 text-xs"
                >
                  No job cards yet. Click &quot;New Job Card&quot; to create one.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500 text-xs">
                  Loading job cards...
                </td>
              </tr>
            )}
            {filteredJobCards.map((jc) => (
              <tr
                key={jc._id.toString()}
                className="border-t border-slate-800/80 hover:bg-slate-900/70"
              >
                <td className="px-3 py-2 align-top">
                  <span className="font-medium text-slate-100">
                    {jc.jobCardNo}
                  </span>
                </td>
                <td className="px-3 py-2 align-top">
                  {jc.clientName || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 align-top">
                  {jc.category || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 align-top">
                  {jc.jobType || <span className="text-slate-500">—</span>}
                </td>
                <td className="px-3 py-2 align-top text-slate-400">
                  {jc.createdAt
                    ? new Date(jc.createdAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—"}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/jobcards/${jc._id.toString()}`}
                      className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-200 hover:border-slate-500"
                    >
                      Edit
                    </Link>
                    <a
                      href={jc.pdfUrl || `/api/pdf/${jc._id.toString()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-sky-500/50 px-2 py-1 text-[10px] text-sky-200 hover:border-sky-400"
                    >
                      View PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(jc._id.toString())}
                      className="rounded border border-red-500/50 px-2 py-1 text-[10px] text-red-200 hover:border-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

