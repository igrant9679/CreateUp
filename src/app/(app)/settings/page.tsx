import Link from "next/link";
import { User, Mail, Lock, Palette, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/acl";
import { db } from "@/lib/db";
import { setThemeAction, getTheme } from "@/app/actions/theme";
import { updateProfileAction, changePasswordAction } from "@/app/actions/profile";
import { resendVerificationAction } from "@/app/actions/auth-flows";

// User-level settings (distinct from /admin/settings which is workspace-level).
// Linked from the avatar button in the left rail.

export default async function UserSettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser();
  const { error, ok } = await searchParams;
  const theme = await getTheme();
  const memberships = await db.membership.findMany({
    where: { userId: user.id, status: "active" },
    include: { workspace: { select: { name: true } } },
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-12 h-12 rounded-2xl text-white grid place-items-center font-mono font-bold text-lg" style={{ background: "linear-gradient(135deg,#E5482F,#6D28D9)" }}>
          {(user.name ?? user.email).slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="font-mono font-bold text-2xl leading-tight">{user.name ?? user.email}</h1>
          <p className="text-xs text-[var(--mute)]">{user.email}</p>
        </div>
      </div>

      {/* Profile */}
      <section className="card mb-4">
        <h2 className="font-mono font-bold text-[14px] mb-3 flex items-center gap-2"><User className="w-4 h-4" style={{ color: "var(--accent)" }} /> Profile</h2>
        <form action={updateProfileAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--mute)]">Display name</span>
            <input name="name" defaultValue={user.name ?? ""} required className="border border-[var(--line-2)] rounded-lg p-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--mute)]">Email <span className="opacity-50">(read-only — contact admin to change)</span></span>
            <input value={user.email} readOnly className="border border-[var(--line-2)] rounded-lg p-2 text-sm bg-[var(--zebra)] font-mono" />
          </label>
          <div className="flex justify-end"><button type="submit" className="btn primary sm">Save profile</button></div>
        </form>
      </section>

      {/* Email verification */}
      <section className="card mb-4">
        <h2 className="font-mono font-bold text-[14px] mb-3 flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: "#2563EB" }} /> Email verification</h2>
        {user.emailVerified ? (
          <p className="text-sm text-[var(--green)] flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Verified on {new Date(user.emailVerified).toLocaleDateString()}.</p>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--mute)] flex-1">Your email isn't verified yet.</p>
            <form action={resendVerificationAction}><button type="submit" className="btn primary sm">Resend verification</button></form>
          </div>
        )}
      </section>

      {/* Change password */}
      <section className="card mb-4">
        <h2 className="font-mono font-bold text-[14px] mb-3 flex items-center gap-2"><Lock className="w-4 h-4" style={{ color: "#D97706" }} /> Change password</h2>
        {error === "wrongpass" && <p className="text-sm text-[var(--brand)] mb-2">Current password doesn&apos;t match.</p>}
        {error === "invalid"   && <p className="text-sm text-[var(--brand)] mb-2">New password must be 8+ characters.</p>}
        {error === "nopass"    && <p className="text-sm text-[var(--brand)] mb-2">No password is set on this account. Use <Link href="/forgot" className="text-[var(--accent)] font-semibold">Forgot password</Link> instead.</p>}
        {ok === "password"     && <p className="text-sm text-[var(--green)] bg-[var(--green-soft)] rounded-md px-3 py-2 mb-2">Password updated.</p>}
        <form action={changePasswordAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--mute)]">Current password</span>
            <input name="current" type="password" required className="border border-[var(--line-2)] rounded-lg p-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--mute)]">New password (8+ chars)</span>
            <input name="next" type="password" required minLength={8} className="border border-[var(--line-2)] rounded-lg p-2 text-sm" />
          </label>
          <div className="flex justify-end"><button type="submit" className="btn primary sm">Change password</button></div>
        </form>
      </section>

      {/* Theme — click to apply instantly (one form per option, auto-submitting). */}
      <section className="card mb-4">
        <h2 className="font-mono font-bold text-[14px] mb-3 flex items-center gap-2"><Palette className="w-4 h-4" style={{ color: "#6D28D9" }} /> Appearance</h2>
        <p className="text-xs text-[var(--mute)] mb-3">Click a mode to apply it instantly.</p>
        <div className="flex gap-2">
          {(["light", "dark", "auto"] as const).map((t) => {
            const active = theme === t;
            return (
              <form key={t} action={setThemeAction} className="flex-1">
                <input type="hidden" name="theme" value={t} />
                <input type="hidden" name="return" value="/settings" />
                <button
                  type="submit"
                  className="card w-full text-center cursor-pointer transition-colors"
                  style={active ? { borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 600 } : undefined}
                >
                  <span className="capitalize">{t}</span>
                  {active && <span className="ml-2 text-[10px] font-mono uppercase tracking-wider">✓ active</span>}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      {/* Workspaces */}
      <section className="card mb-4">
        <h2 className="font-mono font-bold text-[14px] mb-3">Workspaces ({memberships.length})</h2>
        <ul className="m-0 p-0">
          {memberships.map((m) => (
            <li key={m.id} className="border-t border-[var(--line)] first:border-t-0 py-2 text-sm flex items-center gap-2">
              <span className="flex-1">{m.workspace.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{m.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
