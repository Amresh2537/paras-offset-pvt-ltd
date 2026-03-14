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

export async function POST(request) {
  try {
    const { field, value, values } = await request.json();

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

    const incomingValues = Array.isArray(values)
      ? values
      : value !== undefined
        ? [value]
        : [];

    const sanitizedValues = incomingValues
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    if (sanitizedValues.length === 0) {
      return NextResponse.json(
        { message: "At least one valid value is required" },
        { status: 400 }
      );
    }

    const doc = await getSingletonDoc();

    if (!Array.isArray(doc[field])) {
      doc[field] = [];
    }

    const existingSet = new Set(doc[field]);
    const uniqueIncoming = [...new Set(sanitizedValues)];

    let addedCount = 0;
    for (const item of uniqueIncoming) {
      if (!existingSet.has(item)) {
        doc[field].push(item);
        existingSet.add(item);
        addedCount += 1;
      }
    }

    if (addedCount > 0) {
      await doc.save();
    }

    return NextResponse.json({
      message: `Dropdown updated: ${addedCount} added, ${uniqueIncoming.length - addedCount} skipped`,
      dropdowns: doc,
      addedCount,
      skippedCount: uniqueIncoming.length - addedCount,
    });
  } catch (err) {
    console.error("[dropdowns][POST] Error", err);
    return NextResponse.json(
      { message: "Failed to update dropdowns" },
      { status: 500 }
    );
  }
}

