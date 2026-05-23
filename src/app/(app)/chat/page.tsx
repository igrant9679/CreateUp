import { requireMembership } from "@/lib/acl";
import { Placeholder } from "@/components/Placeholder";
export default async function ChatPage() {
  await requireMembership();
  return <Placeholder title="Ideation Chat" tag="Phase 2 · FR-CHAT" />;
}
