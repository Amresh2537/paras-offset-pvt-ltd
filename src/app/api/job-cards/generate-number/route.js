import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const targetUrl = new URL(request.url);
    targetUrl.pathname = "/api/jobcard-numbers";

    const response = await fetch(targetUrl, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[job-cards][generate-number][GET]", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate number" },
      { status: 500 }
    );
  }
}
