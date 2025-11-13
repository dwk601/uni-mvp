import { NextRequest, NextResponse } from "next/server";

const POSTGREST_URL = process.env.NEXT_PUBLIC_POSTGREST_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: { contributionId: string } }
) {
  try {
    const { contributionId } = params;

    if (!contributionId) {
      return NextResponse.json(
        { error: "Contribution ID is required" },
        { status: 400 }
      );
    }

    // Fetch audit trail for the contribution
    const response = await fetch(
      `${POSTGREST_URL}/moderation_actions?contribution_id=eq.${contributionId}&order=timestamp.desc`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("PostgREST error:", error);
      return NextResponse.json(
        { error: "Failed to fetch audit trail", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform snake_case to camelCase for frontend
    const auditTrail = data.map((action: any) => ({
      id: action.id,
      contributionId: action.contribution_id,
      action: action.action,
      reason: action.reason,
      moderatorId: action.moderator_id,
      moderatorName: action.moderator_name,
      timestamp: action.timestamp,
      metadata: action.metadata,
    }));

    return NextResponse.json(auditTrail);
  } catch (error) {
    console.error("Error fetching audit trail:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
