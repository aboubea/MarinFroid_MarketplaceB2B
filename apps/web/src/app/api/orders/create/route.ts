import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { organizations, users } from "@marin-froid/db";
import { submitOrderFromCart } from "@/lib/order-service";
import { getEffectivePermissions } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.organizationId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const deliveryAddressId: string | null = body?.deliveryAddressId ?? null;
  const notes: string | null = typeof body?.notes === "string" ? body.notes.trim().slice(0, 1000) || null : null;

  const db = getDb();
  const [org, user] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, session.organizationId) }),
    db.query.users.findFirst({ where: eq(users.id, session.userId) }),
  ]);
  if (!org || !user) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  if (!getEffectivePermissions(user).canOrder) {
    return NextResponse.json({ error: "Votre profil ne permet pas de valider une commande." }, { status: 403 });
  }

  try {
    const order = await submitOrderFromCart({
      organizationId: org.id,
      organizationName: org.name,
      userId: user.id,
      userEmail: user.email,
      userFullName: user.fullName,
      deliveryAddressId,
      notes,
    });
    return NextResponse.json({ orderId: order.id, reference: order.reference });
  } catch (err) {
    if (err instanceof Error && err.message === "EMPTY_CART") {
      return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur lors de la validation de la commande." }, { status: 500 });
  }
}
