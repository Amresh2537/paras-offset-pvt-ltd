import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dropdowns from "@/models/Dropdowns";

async function getSingletonDoc() {
  await connectDB();
  let doc = await Dropdowns.findOne({});
  if (!doc) {
    doc = await Dropdowns.create({});
  }
  return doc;
}

export async function GET() {
  try {
    const doc = await getSingletonDoc();
    return NextResponse.json({ dropdowns: doc });
  } catch (err) {
    console.error("[dropdowns][GET] Error", err);
    return NextResponse.json(
      { message: "Failed to fetch dropdowns" },
      { status: 500 }
    );
  }
}

// Add a new value to a specific dropdown array
// Body: { field: "clientNames" | "categories" | ..., value: string }
export async function POST(request) {
  try {
    const { field, value } = await request.json();

    const allowedFields = [
      "clientNames",
      "categories",
      "bindingTypes",
      "paperTypes",
      "paperMills",
      "forWhatOptions",
      "printingMachines",
      "operationMachines",
      "jobOperations",
      "itemNames",
      "paperBoardNames",
      "gradeBrands",
      "jobNames",
    ];

    if (!field || !allowedFields.includes(field)) {
      return NextResponse.json(
        { message: "Invalid dropdown field" },
        { status: 400 }
      );
    }

    if (!value || typeof value !== "string") {
      return NextResponse.json(
        { message: "Value is required" },
        { status: 400 }
      );
    }

    const doc = await getSingletonDoc();

    if (!Array.isArray(doc[field])) {
      doc[field] = [];
    }

    if (!doc[field].includes(value)) {
      doc[field].push(value);
      await doc.save();
    }

    return NextResponse.json({
      message: "Dropdown value added",
      dropdowns: doc,
    });
  } catch (err) {
    console.error("[dropdowns][POST] Error", err);
    return NextResponse.json(
      { message: "Failed to update dropdowns" },
      { status: 500 }
    );
  }
}

