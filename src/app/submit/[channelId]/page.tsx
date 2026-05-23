import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { submitAudienceTopicAction } from "@/app/actions/growth";

// FR-SUB-01 — Public audience submission form. No authentication required.
// Lives outside the (app) group so the workspace chrome doesn't load.

export default async function PublicSubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ channelId: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { channelId } = await params;
  const { ok, error } = await searchParams;
  const channel = await db.channel.findUnique({
    where: { id: channelId },
    select: { id: true, name: true, accentColor: true, presentationStyle: true, nicheDescription: true },
  });
  if (!channel) notFound();

  return (
    <div className="flex-1 grid place-items-center p-6 min-h-screen">
      <div className="card w-full max-w-lg">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-12 h-12 rounded-2xl text-white grid place-items-center font-mono font-bold text-lg" style={{ background: channel.accentColor ?? "var(--accent)" }}>{channel.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <h1 className="font-mono font-bold text-xl leading-tight">Suggest a topic to {channel.name}</h1>
            <p className="text-xs text-[var(--mute)]">{channel.nicheDescription?.slice(0, 80) ?? "—"}</p>
          </div>
        </div>

        {ok === "1" ? (
          <div className="text-center py-6">
            <p className="text-sm mb-3">Got it — your suggestion is in the queue. Thanks!</p>
            <a href={`/submit/${channelId}`} className="btn">Submit another</a>
          </div>
        ) : (
          <form action={submitAudienceTopicAction} className="flex flex-col gap-3">
            <input type="hidden" name="channelId" value={channelId} />
            {error === "invalid" && <p className="text-sm text-[var(--brand)]">Please give a topic of at least 5 characters.</p>}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-mono uppercase text-[var(--mute)]">Topic *</span>
              <input name="topic" required minLength={5} maxLength={500} placeholder="What would you love a video on?" className="border border-[var(--line-2)] rounded-lg p-2.5 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-mono uppercase text-[var(--mute)]">Notes (optional)</span>
              <textarea name="notes" rows={3} maxLength={2000} className="border border-[var(--line-2)] rounded-lg p-2.5 text-sm" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-mono uppercase text-[var(--mute)]">Your name or @ (optional)</span>
              <input name="submitter" maxLength={120} className="border border-[var(--line-2)] rounded-lg p-2.5 text-sm" />
            </label>
            <button type="submit" className="btn primary mt-1">Submit</button>
            <p className="text-[10px] font-mono text-[var(--mute)] text-center mt-1">No account needed. Submissions are reviewed before becoming ideas.</p>
          </form>
        )}
      </div>
    </div>
  );
}
