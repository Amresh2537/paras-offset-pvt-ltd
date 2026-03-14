import { NextResponse } from "next/server";

async function forwardToJobcards(request) {
  const targetUrl = new URL(request.url);
  targetUrl.pathname = "/api/jobcards";

  const method = request.method || "GET";
  const init = {
    method,
    cache: "no-store",
    headers: {},
  };

  if (method !== "GET" && method !== "HEAD") {
    init.headers["Content-Type"] = "application/json";
    init.body = await request.text();
  }

  const response = await fetch(targetUrl, init);
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function GET(request) {
  try {
    return await forwardToJobcards(request);
  } catch (error) {
    console.error("[job-cards][GET]", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch job cards" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    return await forwardToJobcards(request);
  } catch (error) {
    console.error("[job-cards][POST]", error);
    return NextResponse.json(
      { message: error.message || "Failed to create job card" },
      { status: 500 }
    );
  }
}
