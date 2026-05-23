import Link from "next/link";
import { LogOut, ChevronDown, Layers, User } from "lucide-react";
import { signOut } from "@/auth";
import { getActiveChannel } from "@/lib/channel";
import { setActiveChannelAction } from "@/app/actions/channel";
import { LeftRailNav, type LeftRailItem } from "@/components/LeftRailNav";

// Each nav item carries its own brand color so the rail reads as a vibrant chip strip
// (mirrors the CreateUp_Mockups.html per-module accent palette).
const NAV: (LeftRailItem & { adminOnly?: boolean })[] = [
  { href: "/dashboard",   label: "Home",        icon: "Home",          color: "#E5482F", soft: "#FDE7E1" },
  { href: "/channels",    label: "Channels",    icon: "Layers",        color: "#7C3AED", soft: "#EEE7FC" },
  { href: "/intel",       label: "Intel",       icon: "Telescope",     color: "#2563EB", soft: "#E5EDFD" },
  { href: "/ideas",       label: "Ideas",       icon: "Sparkles",      color: "#D97706", soft: "#FBEED5" },
  { href: "/scripts",     label: "Scripts",     icon: "PenLine",       color: "#15924B", soft: "#E0F2E8" },
  { href: "/chat",        label: "Chat",        icon: "MessageCircle", color: "#6D28D9", soft: "#EDE7FB" },
  { href: "/thumbnails",  label: "Thumbnails",  icon: "ImageIcon",     color: "#DB2777", soft: "#FBE2EF" },
  { href: "/production",  label: "Production",  icon: "KanbanSquare",  color: "#0D9488", soft: "#D7F1ED" },
  { href: "/help",        label: "Help",        icon: "HelpCircle",    color: "#0891B2", soft: "#D8EFF5" },
  { href: "/admin",       label: "Admin",       icon: "Settings",      color: "#4F46E5", soft: "#E7E6FB", adminOnly: true },
];

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace, membership, channels, active } = await getActiveChannel();
  const userLabel = user.name ?? user.email.split("@")[0];

  return (
    <div className="flex-1 flex min-h-screen">
      <aside className="w-[78px] left-rail border-r border-[var(--line)] flex flex-col items-center gap-2.5 py-5 flex-shrink-0 relative z-40">
        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-2xl text-white grid place-items-center mb-3 font-mono font-bold text-lg shadow-lg shadow-[#E5482F]/30"
          style={{ background: "linear-gradient(150deg,#F0623F,#C53A22)" }}
          title="CreateUp · Home"
        >
          ▲
        </Link>

        <LeftRailNav items={NAV.filter((n) => !n.adminOnly || membership.role === "ADMIN")} />

        {/* Profile + sign out — now with a clearer label */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <Link
            href="/settings"
            title={`${userLabel} · open settings`}
            className="group relative w-11 h-11 rounded-2xl text-white grid place-items-center font-mono font-bold text-[12px] shadow-md hover:scale-105 transition"
            style={{ background: "linear-gradient(135deg,#E5482F,#6D28D9)" }}
            aria-label={`Open ${userLabel}'s settings`}
          >
            <User className="w-[20px] h-[20px]" strokeWidth={2.25} />
            <span className="absolute left-[58px] top-1/2 -translate-y-1/2 whitespace-nowrap text-[12px] font-semibold font-mono px-2.5 py-1 rounded-md text-white shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition pointer-events-none z-30"
                  style={{ background: "linear-gradient(135deg,#E5482F,#6D28D9)" }}>
              {userLabel} · Settings
            </span>
          </Link>
          <form action={signOutAction}>
            <button title="Sign out" className="group relative w-11 h-11 rounded-2xl grid place-items-center text-[var(--mute)] hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] transition">
              <LogOut className="w-[18px] h-[18px]" strokeWidth={2.25} />
              <span className="absolute left-[58px] top-1/2 -translate-y-1/2 whitespace-nowrap text-[12px] font-semibold font-mono px-2.5 py-1 rounded-md text-white shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition pointer-events-none z-30"
                    style={{ background: "var(--brand)" }}>
                Sign out
              </span>
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="min-h-[60px] border-b border-[var(--line)] app-header flex items-center gap-3 px-6 py-2 flex-shrink-0">
          <Link href="/channels" className="font-mono font-bold text-[15px] tracking-tight hover:text-[var(--accent)] transition" title="Manage workspace channels">
            {workspace.name}
          </Link>
          {active && (
            <form action={setActiveChannelAction}>
              <ChannelSelect channels={channels} activeId={active.id} />
            </form>
          )}
          <Link href="/onboarding/channel/new" className="btn sm flex items-center gap-1" title="Create a new YouTube channel">
            <Layers className="w-3.5 h-3.5" /> + Channel
          </Link>
          <Link href="/channels" className="btn sm" title="Manage all channels">Manage channels</Link>
          <div className="flex-1" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-bold px-2 py-1 rounded-md" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{membership.role}</span>
          <span className="text-[12px] text-[var(--mute)]">{user.email}</span>
        </header>

        <main className="flex-1 overflow-auto bg-[var(--panel)] p-6">{children}</main>
      </div>
    </div>
  );
}

function ChannelSelect({ channels, activeId }: { channels: { id: string; name: string; accentColor: string | null }[]; activeId: string }) {
  const active = channels.find((c) => c.id === activeId);
  return (
    <label className="flex items-center gap-2 font-mono text-[13px] font-semibold pl-1.5 pr-2 py-1 rounded-full border border-[var(--line-2)] hover:border-[var(--accent)] transition" title="Active channel — pick to switch">
      <span
        className="w-7 h-7 rounded-full text-white grid place-items-center text-[11px] font-bold"
        style={{ background: active?.accentColor ?? "var(--accent)" }}
        aria-hidden
      >
        {(active?.name ?? "?").slice(0, 1).toUpperCase()}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--mute)]">Active</span>
      <select name="channelId" defaultValue={activeId} className="bg-transparent border-0 focus:outline-none pr-1 cursor-pointer">
        {channels.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-[var(--mute)]" />
      <button type="submit" className="text-[10px] uppercase tracking-wider text-[var(--mute)] hover:text-[var(--accent)] border-l border-[var(--line-2)] pl-2 ml-1">Switch</button>
    </label>
  );
}
