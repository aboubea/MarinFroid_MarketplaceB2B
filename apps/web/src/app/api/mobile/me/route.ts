import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const db = getDb();
  const organization = session.organizationId
    ? await db.query.organizations.findFirst({ where: eq(organizations.id, session.organizationId) })
    : null;

  return NextResponse.json({
    fullName: session.fullName,
    role: session.role,
    organizationName: organization?.name ?? "Marin Froid",
  });
}
