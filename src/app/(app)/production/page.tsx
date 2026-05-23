import { requireMembership } from "@/lib/acl";
import { Placeholder } from "@/components/Placeholder";
export default async function ProductionPage() {
  await requireMembership();
  return <Placeholder title="Production Pipeline" tag="Phase 5 · FR-PIPE / FR-TASK / FR-CAL" />;
}
