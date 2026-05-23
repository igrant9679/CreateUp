import { env } from "@/lib/env";

// Email interface. Used for invitations (FR-AUTH-04) and completion notices
// (FR-AGENT-02). Mock logs to console.

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ id: string }>;
}

const mock: EmailProvider = {
  async send(message) {
    const id = "mock-" + Math.random().toString(36).slice(2, 10);
    // eslint-disable-next-line no-console
    console.log("📧 [mock email]", id, "→", message.to, "\n  subject:", message.subject);
    return { id };
  },
};

export const email: EmailProvider = env.USE_MOCK_EMAIL ? mock : mock;
