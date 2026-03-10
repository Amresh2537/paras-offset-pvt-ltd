import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import JobCard from "@/models/JobCard";

function extractNumeric(jobCardNo) {
  if (!jobCardNo) return 0;
  const match = jobCardNo.toString().match(/\d+/g);
  if (!match) return 0;
  const num = parseInt(match.join(""), 10);
  return Number.isNaN(num) ? 0 : num;
}

export async function GET() {
  try {
    await connectDB();

    const docs = await JobCard.find({}, { jobCardNo: 1 })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    let maxNumeric = 0;
    for (const doc of docs) {
      const n = extractNumeric(doc.jobCardNo);
      if (n > maxNumeric) maxNumeric = n;
    }

    const nextNumber = maxNumeric + 1;

    return NextResponse.json({
      nextJobCardNo: nextNumber.toString(),
      source: "mongo-only",
    });
  } catch (err) {
    console.error("[jobcard-numbers][GET] Error", err);
    return NextResponse.json(
      { message: "Failed to calculate next job card number" },
      { status: 500 }
    );
  }
}

