import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { getCartWithItems, addToCart, updateCartItemQuantity } from "@/lib/cart";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.organizationId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { items } = await getCartWithItems(session.organizationId, session.userId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.organizationId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { productId, quantity, mode } = await request.json();
  if (!productId || quantity === undefined) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const result =
    mode === "set"
      ? await updateCartItemQuantity(session.organizationId, session.userId, productId, quantity)
      : await addToCart(session.organizationId, session.userId, productId, quantity);
  const count = result.items.reduce((sum, i) => sum + i.quantity, 0);
  return NextResponse.json({ ok: true, count, items: result.items });
}
