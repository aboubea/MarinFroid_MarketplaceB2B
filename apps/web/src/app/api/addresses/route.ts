import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { deliveryAddresses } from "@marin-froid/db";

export async function GET() {
  const session = await getSession();
  if (!session || !session.organizationId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const db = getDb();
  const addresses = await db.query.deliveryAddresses.findMany({
    where: eq(deliveryAddresses.organizationId, session.organizationId),
  });
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.organizationId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (session.role !== "org_admin") {
    return NextResponse.json({ error: "Seul l'administrateur de la société peut gérer les adresses." }, { status: 403 });
  }
  const { label, line1, line2, city, postalCode, country, isDefault } = await request.json();
  if (!label || !line1 || !city || !postalCode) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const db = getDb();

  if (isDefault) {
    await db
      .update(deliveryAddresses)
      .set({ isDefault: false })
      .where(eq(deliveryAddresses.organizationId, session.organizationId));
  }

  const [address] = await db
    .insert(deliveryAddresses)
    .values({
      organizationId: session.organizationId,
      label,
      line1,
      line2: line2 || null,
      city,
      postalCode,
      country: country || "FR",
      isDefault: !!isDefault,
    })
    .returning();

  return NextResponse.json({ address });
}
