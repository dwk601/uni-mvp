import { NextRequest, NextResponse } from "next/server";

const POSTGREST_URL = process.env.NEXT_PUBLIC_POSTGREST_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const limit = searchParams.get("limit") || "100";

    // Build query string for PostgREST
    let query = `${POSTGREST_URL}/user_contributions?limit=${limit}&order=submitted_at.desc`;

    if (status) {
      query += `&status=eq.${status}`;
    }

    if (type) {
      query += `&type=eq.${type}`;
    }

    const response = await fetch(query, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("PostgREST error:", error);
      return NextResponse.json(
        { error: "Failed to fetch contributions", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform snake_case to camelCase for frontend
    const contributions = data.map((contrib: any) => ({
      id: contrib.id,
      userId: contrib.user_id,
      userName: contrib.user_name,
      userEmail: contrib.user_email,
      type: contrib.type,
      status: contrib.status,
      submittedAt: contrib.submitted_at,
      reviewedAt: contrib.reviewed_at,
      reviewedBy: contrib.reviewed_by,
      reason: contrib.reason,
      data: contrib.data,
    }));

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
