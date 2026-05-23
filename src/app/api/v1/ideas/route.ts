import { NextRequest, NextResponse } from "next/server";
import { requireMembership } from "@/lib/acl";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { workspace } = await requireMembership();
  const channelId = req.nextUrl.searchParams.get("channelId");
  const ideas = await db.idea.findMany({
    where: { channel: { workspaceId: workspace.id }, ...(channelId ? { channelId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, channelId: true, title: true, topic: true, strategy: true,
      outlierScore: true, suggestedLength: true, status: true, merit: true, createdAt: true,
    },
  });
  return NextResponse.json({ ideas });
}
