import { NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { invitations, organizations } from "@marin-froid/db";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token requis." }, { status: 400 });

  const db = getDb();
  const invitation = await db.query.invitations.findFirst({
    where: and(eq(invitations.token, token), eq(invitations.status, "pending"), gt(invitations.expiresAt, new Date())),
  });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation invalide ou expirée." }, { status: 404 });
  }

  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, invitation.organizationId) });

  return NextResponse.json({ email: invitation.email, organizationName: organization?.name ?? "" });
}
