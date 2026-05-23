export function Placeholder({ title, tag, hint }: { title: string; tag: string; hint?: string }) {
  return (
    <div className="max-w-2xl card">
      <h1 className="font-mono font-bold text-xl mb-1">{title}</h1>
      <p className="text-xs font-mono text-[var(--mute)] mb-3">{tag}</p>
      <p className="text-sm text-[var(--mute)]">{hint ?? "Not built yet. Track progress in BUILD_PLAN.md."}</p>
    </div>
  );
}
