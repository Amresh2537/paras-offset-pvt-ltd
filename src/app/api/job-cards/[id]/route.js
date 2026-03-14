import { NextResponse } from "next/server";

async function forwardToJobcardById(request, id) {
  const targetUrl = new URL(request.url);
  targetUrl.pathname = `/api/jobcards/${id}`;

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

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    return await forwardToJobcardById(request, id);
  } catch (error) {
    console.error("[job-cards][id][GET]", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch job card" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    return await forwardToJobcardById(request, id);
  } catch (error) {
    console.error("[job-cards][id][PUT]", error);
    return NextResponse.json(
      { message: error.message || "Failed to update job card" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    return await forwardToJobcardById(request, id);
  } catch (error) {
    console.error("[job-cards][id][DELETE]", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete job card" },
      { status: 500 }
    );
  }
}
