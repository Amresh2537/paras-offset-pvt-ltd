import JobCardForm from "@/components/JobCardForm";
import { connectDB } from "@/lib/db";
import JobCard from "@/models/JobCard";

export const dynamic = "force-dynamic";

export default async function EditJobCardPage({ params }) {
  const { id } = await params;
  await connectDB();
  const jobCard = await JobCard.findById(id).lean();

  if (!jobCard) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
        Job card not found.
      </div>
    );
  }

  return <JobCardForm mode="edit" initialData={JSON.parse(JSON.stringify(jobCard))} />;
}
