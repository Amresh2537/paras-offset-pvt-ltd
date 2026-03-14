"use client";

import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN");
  } catch {
    return "";
  }
}

export default function FmsPage() {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCards() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobcards", { cache: "no-store" });
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

  useEffect(() => {
    void loadCards();
  }, []);

  const groupedRows = useMemo(() => {
    return jobCards.map((jobCard) => {
      const details = (jobCard.jobDetails || []).filter((item) => item?.jobName);
      const statuses = jobCard.fmsStatusByJob || [];
      const rows = details.length > 0 ? details : [{ jobName: "-", qty: "", itemCode: "" }];
      return {
        jobCard,
        statuses,
        rows,
      };
    });
  }, [jobCards]);

  async function updateStatus(jobCardId, rowIndex, value) {
    const target = jobCards.find((card) => String(card._id) === String(jobCardId));
    if (!target) return;

    const nextStatuses = [...(target.fmsStatusByJob || [])];
    nextStatuses[rowIndex] = value;

    setJobCards((prev) =>
      prev.map((card) =>
        String(card._id) === String(jobCardId)
          ? { ...card, fmsStatusByJob: nextStatuses }
          : card
      )
    );

    await fetch(`/api/jobcards/${jobCardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fmsStatusByJob: nextStatuses }),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">FMS</h1>
        <p className="text-sm text-slate-600">Job card wise production status (grouped by Job Card, then Job Name).</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[2200px] w-full text-xs text-slate-800">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-2 text-left">Date</th>
              <th className="border px-2 py-2 text-left">Job No</th>
              <th className="border px-2 py-2 text-left">Party Name</th>
              <th className="border px-2 py-2 text-left">JOB TYPE</th>
              <th className="border px-2 py-2 text-left">PO.No</th>
              <th className="border px-2 py-2 text-left">OLD Job No</th>
              <th className="border px-2 py-2 text-left">Item Name</th>
              <th className="border px-2 py-2 text-left">Item Code</th>
              <th className="border px-2 py-2 text-left">QTY</th>
              <th className="border px-2 py-2 text-left">Job Owner</th>
              <th className="border px-2 py-2 text-left">Designer</th>
              <th className="border px-2 py-2 text-left">Order confirmation date</th>
              <th className="border px-2 py-2 text-left">Artwork Received?</th>
              <th className="border px-2 py-2 text-left">Artwork Received Date</th>
              <th className="border px-2 py-2 text-left">Artwork Approved?</th>
              <th className="border px-2 py-2 text-left">Artwork Approved Date</th>
              <th className="border px-2 py-2 text-left">Sent to Printing?</th>
              <th className="border px-2 py-2 text-left">PO/ PI</th>
              <th className="border px-2 py-2 text-left">Approved Cost Sheet</th>
              <th className="border px-2 py-2 text-left">Sent to Printing Date</th>
              <th className="border px-2 py-2 text-left">Planned PO Approval Date</th>
              <th className="border px-2 py-2 text-left">Actual PO Approval Date</th>
              <th className="border px-2 py-2 text-left">PI/ PO Approved?</th>
              <th className="border px-2 py-2 text-left">Printing Approval Date</th>
              <th className="border px-2 py-2 text-left">PO Value</th>
              <th className="border px-2 py-2 text-left">Job Value</th>
              <th className="border px-2 py-2 text-left">Variation</th>
              <th className="border px-2 py-2 text-left">Dispatch QTY</th>
              <th className="border px-2 py-2 text-left">Status</th>
              <th className="border px-2 py-2 text-left">Close Job Card?</th>
              <th className="border px-2 py-2 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="border px-2 py-3 text-center" colSpan={31}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && groupedRows.length === 0 && (
              <tr>
                <td className="border px-2 py-3 text-center" colSpan={31}>
                  No job cards found
                </td>
              </tr>
            )}
            {groupedRows.map(({ jobCard, rows }) =>
              rows.map((item, rowIndex) => (
                <tr key={`${jobCard._id}-${rowIndex}`} className="hover:bg-slate-50">
                  <td className="border px-2 py-1">{formatDate(jobCard.date || jobCard.createdAt)}</td>
                  <td className="border px-2 py-1 font-medium">{jobCard.jobCardNo || ""}</td>
                  <td className="border px-2 py-1">{jobCard.clientName || ""}</td>
                  <td className="border px-2 py-1">{jobCard.jobType || ""}</td>
                  <td className="border px-2 py-1">{jobCard.poNo || ""}</td>
                  <td className="border px-2 py-1">{jobCard.oldJobNo || ""}</td>
                  <td className="border px-2 py-1">{item.jobName || ""}</td>
                  <td className="border px-2 py-1">{item.itemCode || ""}</td>
                  <td className="border px-2 py-1">{item.qty || ""}</td>
                  <td className="border px-2 py-1">{jobCard.jobOwner || ""}</td>
                  <td className="border px-2 py-1">{jobCard.designer || ""}</td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1">
                    <select
                      value={jobCard.fmsStatusByJob?.[rowIndex] || "Pending"}
                      onChange={(e) => updateStatus(jobCard._id, rowIndex, e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-2 py-1">{jobCard.closeJobCard ? "Yes" : "No"}</td>
                  <td className="border px-2 py-1">{jobCard.fmsRemarks || ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
