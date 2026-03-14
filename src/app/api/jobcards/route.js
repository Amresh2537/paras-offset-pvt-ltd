import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import JobCard from "@/models/JobCard";

export async function GET() {
  try {
    await connectDB();
    const jobCards = await JobCard.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ jobCards });
  } catch (err) {
    console.error("[jobcards][GET] Error", err);
    return NextResponse.json(
      { message: "Failed to fetch job cards" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    await connectDB();

    const existing = await JobCard.findOne({ jobCardNo: body.jobCardNo });
    if (existing) {
      return NextResponse.json(
        { message: "Job card with this number already exists" },
        { status: 400 }
      );
    }

    const jobCard = await JobCard.create(body);
    const pdfUrl = `/api/pdf/${jobCard._id}`;

    if (jobCard.pdfUrl !== pdfUrl) {
      jobCard.pdfUrl = pdfUrl;
      await jobCard.save();
    }

    return NextResponse.json(
      { message: "Job card created", jobCard, pdfUrl },
      { status: 201 }
    );
  } catch (err) {
    console.error("[jobcards][POST] Error", err);
    return NextResponse.json(
      { message: "Failed to create job card" },
      { status: 500 }
    );
  }
}

