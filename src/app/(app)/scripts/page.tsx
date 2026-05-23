import { requireMembership } from "@/lib/acl";
import { Placeholder } from "@/components/Placeholder";
export default async function ScriptsPage() {
  await requireMembership();
  return <Placeholder title="Scripts" tag="Phase 3 · FR-CANV / FR-SB" />;
}
