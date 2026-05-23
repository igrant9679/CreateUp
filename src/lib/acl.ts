import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

// Per FR-AUTH-05 / FR-AUTH-08 / NFR-SEC-01: enforce role + workspace scoping
// server-side on every endpoint. Helpers below are the only way the app
// resolves "who is the current user, what workspace, what role."

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { memberships: { include: { workspace: true } } },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

export async function requireMembership(workspaceId?: string) {
  const user = await requireUser();
  const memberships = user.memberships.filter((m) => m.status === "active");
  if (memberships.length === 0) redirect("/onboarding/workspace");
  const target = workspaceId
    ? memberships.find((m) => m.workspaceId === workspaceId)
    : memberships[0];
  if (!target) redirect("/forbidden");
  return { user, membership: target, workspace: target.workspace };
}

export function canEdit(role: Role): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

export function canAdmin(role: Role): boolean {
  return role === "ADMIN";
}

export async function requireRole(needed: Role, workspaceId?: string) {
  const ctx = await requireMembership(workspaceId);
  const rank: Record<Role, number> = { VIEWER: 0, EDITOR: 1, ADMIN: 2 };
  if (rank[ctx.membership.role] < rank[needed]) redirect("/forbidden");
  return ctx;
}
