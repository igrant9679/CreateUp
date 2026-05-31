"use client";

import { ChevronDown } from "lucide-react";

// Channel <select> that submits its enclosing form on change, so switching the
// active channel is one interaction instead of "pick + click Switch". Rendered
// inside the server-action <form> in the app header.
export function ChannelSwitcher({
  channels,
  activeId,
}: {
  channels: { id: string; name: string }[];
  activeId: string;
}) {
  return (
    <span className="relative inline-flex items-center">
      <select
        name="channelId"
        defaultValue={activeId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Switch active channel"
        className="appearance-none bg-transparent border-0 pl-1 pr-5 cursor-pointer rounded font-mono text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
      >
        {channels.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-[var(--mute)] pointer-events-none absolute right-0" aria-hidden />
    </span>
  );
}
