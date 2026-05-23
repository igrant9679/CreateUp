import { requireMembership } from "@/lib/acl";
import { Placeholder } from "@/components/Placeholder";
export default async function ThumbnailsPage() {
  await requireMembership();
  return <Placeholder title="Thumbnails" tag="Phase 4 · FR-THUMB" />;
}
