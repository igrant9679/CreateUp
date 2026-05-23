import { requireMembership } from "@/lib/acl";
import { Placeholder } from "@/components/Placeholder";
export default async function IdeasPage() {
  await requireMembership();
  return <Placeholder title="Ideas" tag="Phase 2 · FR-IDEA" />;
}
