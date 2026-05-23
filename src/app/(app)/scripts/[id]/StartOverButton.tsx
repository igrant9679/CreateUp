"use client";

import { Eraser } from "lucide-react";
import { startOverAction } from "@/app/actions/canvas";

// FR-CANV-12 — confirmation before destructive Start Over.
export function StartOverButton({ scriptId, hasBody }: { scriptId: string; hasBody: boolean }) {
  return (
    <form
      action={startOverAction}
      onSubmit={(e) => {
        if (hasBody && !confirm("Wipe outline + body and start over? Your current version will be snapshotted to history.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="scriptId" value={scriptId} />
      <button type="submit" className="btn sm flex items-center gap-1.5">
        <Eraser className="w-3.5 h-3.5" /> Start over
      </button>
    </form>
  );
}
