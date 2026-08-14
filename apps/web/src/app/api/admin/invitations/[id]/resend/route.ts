import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { invitations, organizations } from "@marin-froid/db";
import { createEmailClient, invitationEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "@/lib/notification-settings";
import { sendTrackedEmail } from "@/lib/email-log";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();

  const db = getDb();
  const invitation = await db.query.invitations.findFirst({ where: eq(invitations.id, id) });
  if (!invitation) return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await db.update(invitations).set({ token, expiresAt, status: "pending" }).where(eq(invitations.id, id));

  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, invitation.organizationId) });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && organization && (await isNotificationEnabled("invitation_sent", "customer"))) {
    const emailClient = createEmailClient(apiKey);
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const template = invitationEmail({
      organizationName: organization.name,
      activationUrl: `${baseUrl}/activate?token=${token}`,
    });
    await sendTrackedEmail(emailClient, "invitation_sent", { to: invitation.email, ...template });
  }

  return NextResponse.json({ ok: true });
}
