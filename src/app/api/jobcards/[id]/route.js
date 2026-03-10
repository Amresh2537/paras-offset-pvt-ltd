import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import JobCard from "@/models/JobCard";

export async function GET(_request, { params }) {
  try {
    const { id } = params;
    await connectDB();
    const jobCard = await JobCard.findById(id).lean();

    if (!jobCard) {
      return NextResponse.json(
        { message: "Job card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ jobCard });
  } catch (err) {
    console.error("[jobcards][id][GET] Error", err);
    return NextResponse.json(
      { message: "Failed to fetch job card" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    await connectDB();

    const jobCard = await JobCard.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!jobCard) {
      return NextResponse.json(
        { message: "Job card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Job card updated", jobCard });
  } catch (err) {
    console.error("[jobcards][id][PUT] Error", err);
    return NextResponse.json(
      { message: "Failed to update job card" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    const result = await JobCard.findByIdAndDelete(id).lean();

    if (!result) {
      return NextResponse.json(
        { message: "Job card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Job card deleted" });
  } catch (err) {
    console.error("[jobcards][id][DELETE] Error", err);
    return NextResponse.json(
      { message: "Failed to delete job card" },
      { status: 500 }
    );
  }
}

