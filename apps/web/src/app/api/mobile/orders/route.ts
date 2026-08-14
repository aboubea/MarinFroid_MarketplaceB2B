import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";
import { orders } from "@marin-froid/db";
import { submitOrderFromCart } from "@/lib/order-service";
import { organizations, users } from "@marin-froid/db";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.organizationId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const db = getDb();
  const list = await db.query.orders.findMany({
    where: eq(orders.organizationId, session.organizationId),
    orderBy: [desc(orders.createdAt)],
  });
  return NextResponse.json({
    orders: list.map((o) => ({ id: o.id, reference: o.reference, status: o.status, createdAt: o.createdAt })),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.organizationId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const db = getDb();
  const [org, user] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, session.organizationId) }),
    db.query.users.findFirst({ where: eq(users.id, session.userId) }),
  ]);
  if (!org || !user) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

  try {
    const order = await submitOrderFromCart({
      organizationId: org.id,
      organizationName: org.name,
      userId: user.id,
      userEmail: user.email,
    });
    return NextResponse.json({ orderId: order.id, reference: order.reference });
  } catch (err) {
    if (err instanceof Error && err.message === "EMPTY_CART") {
      return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erreur lors de la validation." }, { status: 500 });
  }
}
