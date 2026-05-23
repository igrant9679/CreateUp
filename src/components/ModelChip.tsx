import { Zap, Gauge, FileText } from "lucide-react";
import type { ModelDescriptor } from "@/lib/llm";

// Surface model characteristics (speed, length adherence, style)
// next to each option so creators can pick the right one for the job.

const SPEED_COLOR: Record<ModelDescriptor["speed"], string> = {
  fast:     "#15924B",
  balanced: "#2563EB",
  slow:     "#6D28D9",
};

const LENGTH_COLOR: Record<ModelDescriptor["lengthAdherence"], string> = {
  loose:  "#D97706",
  medium: "#2563EB",
  strict: "#15924B",
};

export function ModelChip({ model }: { model: ModelDescriptor }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider">
      <span title={`Speed: ${model.speed}`} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ background: SPEED_COLOR[model.speed] + "22", color: SPEED_COLOR[model.speed] }}>
        <Zap className="w-2.5 h-2.5" /> {model.speed}
      </span>
      <span title={`Length adherence: ${model.lengthAdherence}`} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ background: LENGTH_COLOR[model.lengthAdherence] + "22", color: LENGTH_COLOR[model.lengthAdherence] }}>
        <FileText className="w-2.5 h-2.5" /> {model.lengthAdherence}
      </span>
    </span>
  );
}

// image-gen guidance hint (used on the Thumbnail Studio header).
export function ImageGenHint() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: "#FBE2EF", color: "#DB2777" }}>
      <Gauge className="w-2.5 h-2.5" /> Image model
    </span>
  );
}
