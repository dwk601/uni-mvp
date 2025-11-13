import { NextRequest, NextResponse } from "next/server";

const POSTGREST_URL = process.env.NEXT_PUBLIC_POSTGREST_URL || "http://localhost:3000";

interface RejectRequest {
  ids: string[];
  reason: string;
  moderatorId: string;
  moderatorName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RejectRequest = await request.json();
    const { ids, reason, moderatorId, moderatorName } = body;

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "No contribution IDs provided" }, { status: 400 });
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Update contributions to REJECTED status
    const updatePromises = ids.map((id) =>
      fetch(`${POSTGREST_URL}/user_contributions?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          status: "REJECTED",
          reviewed_at: now,
          reviewed_by: moderatorId,
          reason: reason,
        }),
      })
    );

    const updateResponses = await Promise.all(updatePromises);

    // Check for errors
    const errors = [];
    for (let i = 0; i < updateResponses.length; i++) {
      if (!updateResponses[i].ok) {
        const errorText = await updateResponses[i].text();
        errors.push({ id: ids[i], error: errorText });
      }
    }

    if (errors.length > 0) {
      console.error("Errors rejecting contributions:", errors);
      return NextResponse.json(
        { error: "Some contributions failed to reject", details: errors },
        { status: 207 } // Multi-Status
      );
    }

    // Create audit trail entries
    const auditPromises = ids.map((id) =>
      fetch(`${POSTGREST_URL}/moderation_actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          contribution_id: id,
          action: "REJECT",
          reason: reason,
          moderator_id: moderatorId,
          moderator_name: moderatorName,
          timestamp: now,
        }),
      })
    );

    await Promise.all(auditPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully rejected ${ids.length} contribution(s)`,
      count: ids.length,
    });
  } catch (error) {
    console.error("Error rejecting contributions:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
