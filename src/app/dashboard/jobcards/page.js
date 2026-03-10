import { connectDB } from "@/lib/db";
import JobCard from "@/models/JobCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JobCardsListPage() {
  await connectDB();
  const jobCards = await JobCard.find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Job Cards
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View recently created job cards and open the form to add more.
          </p>
        </div>
        <Link
          href="/dashboard/jobcards/new"
          className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
        >
          + New Job Card
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
        <table className="min-w-full text-[11px] text-slate-200">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Job Card No</th>
              <th className="px-3 py-2 text-left font-medium">Client</th>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-left font-medium">Job Type</th>
              <th className="px-3 py-2 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobCards.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-slate-500 text-xs"
                >
                  No job cards yet. Click &quot;New Job Card&quot; to create one.
                </td>
              </tr>
            )}
            {jobCards.map((jc) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

