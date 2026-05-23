import Link from "next/link";
import { requireMembership } from "@/lib/acl";
import { signOut } from "@/auth";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/intel", label: "Intel", icon: "◎" },
  { href: "/ideas", label: "Ideas", icon: "✦" },
  { href: "/scripts", label: "Scripts", icon: "✎" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/thumbnails", label: "Thumbnails", icon: "▣" },
  { href: "/production", label: "Production", icon: "▤" },
  { href: "/admin", label: "Admin", icon: "⚙", adminOnly: true },
];

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace, membership } = await requireMembership();
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div className="flex-1 flex min-h-screen">
      <aside className="w-16 bg-gradient-to-b from-white to-[#fafbfc] border-r border-[var(--line)] flex flex-col items-center gap-2 py-4 flex-shrink-0">
        <Link href="/dashboard" className="w-9 h-9 rounded-[10px] text-white grid place-items-center mb-2 font-mono font-bold" style={{ background: "linear-gradient(150deg,#F0623F,#C53A22)" }}>▲</Link>
        {NAV.filter((n) => !n.adminOnly || membership.role === "ADMIN").map((n) => (
          <Link key={n.href} href={n.href} title={n.label} className="w-9 h-9 rounded-[10px] grid place-items-center text-[#98a0ab] hover:bg-[var(--panel)] hover:text-[var(--slate)] transition">
            <span className="text-base">{n.icon}</span>
          </Link>
        ))}
        <form action={signOutAction} className="mt-auto">
          <button title="Sign out" className="w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] grid place-items-center font-mono font-bold text-[11px]">{initials}</button>
        </form>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="min-h-[55px] border-b border-[var(--line)] bg-white flex items-center gap-3 px-5 py-2 flex-shrink-0">
          <div className="font-mono font-semibold text-[15px]">{workspace.name}</div>
          <div className="flex-1" />
          <span className="font-mono text-xs text-[var(--mute)]">{membership.role}</span>
          <span className="font-mono text-xs text-[var(--mute)]">·</span>
          <span className="text-xs text-[var(--mute)]">{user.email}</span>
        </header>

        <main className="flex-1 overflow-auto bg-[var(--panel)] p-5">{children}</main>
      </div>
    </div>
  );
}
