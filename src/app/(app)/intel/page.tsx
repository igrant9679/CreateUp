import { requireMembership } from "@/lib/acl";
import { Placeholder } from "@/components/Placeholder";
export default async function IntelPage() {
  await requireMembership();
  return <Placeholder title="Intel" tag="Phase 2 · FR-INTEL" />;
}
