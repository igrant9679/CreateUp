import { NextResponse } from "next/server";
import { requireMembership } from "@/lib/acl";
import { db } from "@/lib/db";

// GET /api/v1/channels — list channels for the calling user's workspace.

export async function GET() {
  const { workspace } = await requireMembership();
  const channels = await db.channel.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, nicheDescription: true, presentationStyle: true,
      linkedYoutubeHandle: true, defaultLanguage: true, defaultModel: true,
      createdAt: true, updatedAt: true,
    },
  });
  return NextResponse.json({ channels });
}
