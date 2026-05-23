import Link from "next/link";
import { requireMembership } from "@/lib/acl";
import { db } from "@/lib/db";

// MU-01 — Dashboard home. Shows workspace overview, recent scripts, idea pipeline.
// Implements FR-ADMIN-04 surface (lightweight) and the cross-cutting home view.

export default async function DashboardPage() {
  const { workspace, user } = await requireMembership();

  const [channelCount, scriptCount, ideaCount, recentScripts, recentIdeas] = await Promise.all([
    db.channel.count({ where: { workspaceId: workspace.id } }),
    db.script.count({ where: { channel: { workspaceId: workspace.id } } }),
    db.idea.count({ where: { channel: { workspaceId: workspace.id } } }),
    db.script.findMany({
      where: { channel: { workspaceId: workspace.id } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { channel: { select: { name: true, accentColor: true } } },
    }),
    db.idea.findMany({
      where: { channel: { workspaceId: workspace.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { channel: { select: { name: true, accentColor: true } } },
    }),
  ]);

  return (
    <div>
      <div className="rounded-2xl p-6 mb-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#E5482F,#B5371F)" }}>
        <h1 className="font-mono text-2xl m-0 flex items-center gap-3">Welcome back, {user.name?.split(" ")[0] ?? "Creator"} ✦</h1>
        <p className="opacity-90 text-sm mt-1">From idea to first draft in about twelve minutes. Pick up where you left off.</p>
        <div className="absolute right-5 top-5 flex gap-2">
          <span className="bg-white/20 border border-white/30 text-xs px-3 py-1.5 rounded-lg font-medium">{channelCount} channels</span>
          <span className="bg-white/20 border border-white/30 text-xs px-3 py-1.5 rounded-lg font-medium">{scriptCount} scripts</span>
          <span className="bg-white/20 border border-white/30 text-xs px-3 py-1.5 rounded-lg font-medium">{ideaCount} ideas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card">
          <h2 className="font-mono text-[15px] mb-3 flex items-center gap-2"><span style={{ color: "var(--accent)" }}>✎</span> Recent scripts</h2>
          {recentScripts.length === 0 && <EmptyHint label="No scripts yet" cta={{ href: "/scripts/new", text: "Start a script" }} />}
          <ul className="m-0 p-0">
            {recentScripts.map((s) => (
              <li key={s.id} className="border-t border-[var(--line)] first:border-t-0 py-3 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg grid place-items-center font-mono text-xs font-bold text-white" style={{ background: s.channel.accentColor ?? "var(--accent)" }}>{s.channel.name.slice(0, 2).toUpperCase()}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{s.title}</div>
                  <div className="text-xs text-[var(--mute)]">{s.channel.name} · {s.wordCount} words · {s.status}</div>
                </div>
                <Link href={`/scripts/${s.id}`} className="btn sm">Open</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="font-mono text-[15px] mb-3 flex items-center gap-2"><span style={{ color: "var(--accent)" }}>✦</span> Latest ideas</h2>
          {recentIdeas.length === 0 && <EmptyHint label="No ideas yet" cta={{ href: "/ideas", text: "Generate ideas" }} />}
          <ul className="m-0 p-0">
            {recentIdeas.map((i) => (
              <li key={i.id} className="border-t border-[var(--line)] first:border-t-0 py-3 flex items-center gap-3">
                <span className="tag" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{i.outlierScore?.toFixed(1) ?? "—"}x</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{i.title}</div>
                  <div className="text-xs text-[var(--mute)]">{i.channel.name} · {i.suggestedLength ?? "—"}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function EmptyHint({ label, cta }: { label: string; cta: { href: string; text: string } }) {
  return (
    <div className="text-sm text-[var(--mute)] py-6 text-center">
      <div className="mb-3">{label}</div>
      <Link href={cta.href} className="btn primary sm">{cta.text}</Link>
    </div>
  );
}
