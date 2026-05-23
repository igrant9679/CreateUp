"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireUser } from "@/lib/acl";
import { db } from "@/lib/db";

const profileSchema = z.object({
  name: z.string().min(1).max(120),
});

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return;
  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  revalidatePath("/settings");
}

const passwordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(8).max(120),
});

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
  });
  if (!parsed.success) {
    const { redirect } = await import("next/navigation");
    redirect("/settings?error=invalid");
  }
  if (!user.passwordHash) {
    // No password set (e.g. SSO-only); fall back to forgot-password flow.
    const { redirect } = await import("next/navigation");
    redirect("/settings?error=nopass");
  }
  const ok = await bcrypt.compare(parsed.data!.current, user.passwordHash!);
  if (!ok) {
    const { redirect } = await import("next/navigation");
    redirect("/settings?error=wrongpass");
  }
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data!.next, 10) },
  });
  const { redirect } = await import("next/navigation");
  redirect("/settings?ok=password");
}
