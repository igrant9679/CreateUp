import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { HelpCircle, Keyboard, Palette, Sparkles, ExternalLink } from "lucide-react";
import { setThemeAction, getTheme } from "@/app/actions/theme";
import { HelpClient } from "./HelpClient";

// User Guide / Help center. Searchable FAQ + per-role quick starts
// + appearance + shortcuts in one place.

const QUICK_START = [
  { role: "New creator (solo)",         steps: ["Create your channel", "Browse 10 starter ideas", "Click Write on one", "Run Agent → coffee → script done"] },
  { role: "Established creator",        steps: ["Connect your YouTube handle in onboarding", "Voice trains from your top 10 videos", "Edit Voice in Simple mode", "Use Canvas + Humanize"] },
  { role: "Agency / Team lead",         steps: ["Add team in Admin → Users", "Create one channel per client (or per series)", "Set per-channel default models & templates", "Use Production board to track each video"] },
  { role: "Faceless / Multi-channel",   steps: ["Create multiple channels", "Switch the active channel via topbar pill", "Use Borrow-a-voice to bootstrap a similar style", "Templates make recurring formats one-click"] },
];

const SHORTCUTS = [
  { keys: "Ctrl/⌘ + /", action: "Open Prompt Library (in chat)" },
  { keys: "Esc",        action: "Close Prompt Library or Improve modal" },
  { keys: "Tab",        action: "Move through form fields" },
];

export default async function HelpPage() {
  const theme = await getTheme();

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-12 h-12 rounded-2xl grid place-items-center" style={{ background: "#D8EFF5", color: "#0891B2" }}>
          <HelpCircle className="w-6 h-6" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-mono font-bold text-2xl leading-tight">Help center</h1>
          <p className="text-xs text-[var(--mute)]">Searchable FAQ, quick starts, shortcuts, and appearance — for you and your whole team.</p>
        </div>
      </div>

      {/* Quick starts by role */}
      <section className="card mb-4">
        <h2 className="font-mono font-bold text-[14px] mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} /> Quick start by role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_START.map((qs) => (
            <div key={qs.role} className="border border-[var(--line)] rounded-xl p-3">
              <div className="text-sm font-semibold mb-2">{qs.role}</div>
              <ol className="m-0 pl-4 list-decimal text-xs text-[var(--mute)] space-y-1">
                {qs.steps.map((s, i) => (<li key={i}>{s}</li>))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Appearance + shortcuts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <section className="card">
          <h2 className="font-mono font-bold text-[14px] mb-3 flex items-center gap-2"><Palette className="w-4 h-4" style={{ color: "#6D28D9" }} /> Appearance</h2>
          <form action={setThemeAction} className="flex flex-col sm:flex-row gap-2 items-stretch">
            <input type="hidden" name="return" value="/help" />
            {(["light", "dark", "auto"] as const).map((t) => (
              <label key={t} className="flex-1 cursor-pointer border rounded-lg p-2.5 text-center transition has-[input:checked]:border-[var(--accent)] has-[input:checked]:bg-[var(--accent-soft)]" style={{ borderColor: theme === t ? "var(--accent)" : "var(--line-2)" }}>
                <input type="radio" name="theme" value={t} defaultChecked={theme === t} className="hidden" />
                <span className="text-sm capitalize font-semibold">{t}</span>
                <div className="text-[10px] font-mono text-[var(--mute)] uppercase tracking-wider mt-0.5">
                  {t === "auto" ? "Match OS" : t === "dark" ? "Reduce eye strain" : "Default"}
                </div>
              </label>
            ))}
            <SubmitButton className="btn primary">Save</SubmitButton>
          </form>
        </section>

        <section className="card">
          <h2 className="font-mono font-bold text-[14px] mb-3 flex items-center gap-2"><Keyboard className="w-4 h-4" style={{ color: "var(--accent)" }} /> Keyboard shortcuts</h2>
          <ul className="m-0 p-0">
            {SHORTCUTS.map((s) => (
              <li key={s.keys} className="border-t border-[var(--line)] first:border-t-0 py-2 flex items-center gap-3 text-sm">
                <kbd className="px-2 py-0.5 rounded bg-[var(--zebra)] border border-[var(--line-2)] text-xs font-mono whitespace-nowrap">{s.keys}</kbd>
                <span className="flex-1">{s.action}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Useful links */}
      <section className="card mb-5">
        <h2 className="font-mono font-bold text-[14px] mb-3">Useful links</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/channels" className="btn sm flex items-center gap-1.5">Manage channels <ExternalLink className="w-3 h-3" /></Link>
          <Link href="/onboarding/channel/new" className="btn sm flex items-center gap-1.5">New channel <ExternalLink className="w-3 h-3" /></Link>
          <Link href="/intel" className="btn sm flex items-center gap-1.5">Intel <ExternalLink className="w-3 h-3" /></Link>
          <Link href="/scripts" className="btn sm flex items-center gap-1.5">Scripts <ExternalLink className="w-3 h-3" /></Link>
          <Link href="/production" className="btn sm flex items-center gap-1.5">Production board <ExternalLink className="w-3 h-3" /></Link>
          <Link href="/admin" className="btn sm flex items-center gap-1.5">Admin <ExternalLink className="w-3 h-3" /></Link>
          <Link href="/settings" className="btn sm flex items-center gap-1.5">Profile <ExternalLink className="w-3 h-3" /></Link>
        </div>
      </section>

      {/* Searchable FAQ */}
      <h2 className="font-mono font-bold text-[15px] mb-3 mt-2">Frequently asked questions</h2>
      <HelpClient />
    </div>
  );
}
