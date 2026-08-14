import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, invitations } from "@marin-froid/db";
import { createEmailClient, invitationEmail } from "@marin-froid/email";
import { logActivity } from "@/lib/activity";
import { sendTrackedEmail } from "@/lib/email-log";

export async function POST(request: Request) {
  const session = await requireMarinFroidSession();
  const { orgName, contactEmail, contactName } = await request.json();

  if (!orgName || !contactEmail || !contactName) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const db = getDb();
  const [org] = await db.insert(organizations).values({ name: orgName, status: "invited" }).returning();

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.insert(invitations).values({
    email: contactEmail.toLowerCase().trim(),
    organizationId: org.id,
    role: "org_admin",
    token,
    expiresAt,
    invitedByUserId: session.userId,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const emailClient = createEmailClient(apiKey);
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const template = invitationEmail({
      organizationName: org.name,
      activationUrl: `${baseUrl}/activate?token=${token}`,
    });
    await sendTrackedEmail(emailClient, "invitation_sent", { to: contactEmail, ...template });
  }

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: org.id,
    action: "invitation_sent",
    entityType: "organization",
    entityId: org.id,
    summary: `Société « ${org.name} » invitée (contact ${contactEmail})`,
  });

  return NextResponse.json({ ok: true, organizationId: org.id });
}
