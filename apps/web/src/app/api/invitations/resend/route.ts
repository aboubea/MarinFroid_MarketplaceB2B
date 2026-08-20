import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { invitations, organizations } from "@marin-froid/db";
import { createEmailClient, invitationEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "@/lib/notification-settings";
import { sendTrackedEmail } from "@/lib/email-log";
import { getBaseUrl } from "@/lib/base-url";

// Public, self-service resend for someone who has an invitation but lost
// the link. Always responds { ok: true } regardless of whether the email
// matches anything, so this can't be used to enumerate invited addresses.
export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email || typeof email !== "string") return NextResponse.json({ ok: true });

  const db = getDb();
  const invitation = await db.query.invitations.findFirst({
    where: and(eq(invitations.email, email.toLowerCase().trim()), eq(invitations.status, "pending")),
  });

  if (invitation) {
    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await db.update(invitations).set({ token, expiresAt }).where(eq(invitations.id, invitation.id));

    const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, invitation.organizationId) });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && organization && (await isNotificationEnabled("invitation_sent", "customer"))) {
      const emailClient = createEmailClient(apiKey);
      const baseUrl = getBaseUrl(request);
      const template = invitationEmail({
        organizationName: organization.name,
        activationUrl: `${baseUrl}/activate?token=${token}`,
      });
      await sendTrackedEmail(emailClient, "invitation_sent", { to: invitation.email, ...template });
    }
  }

  return NextResponse.json({ ok: true });
}
