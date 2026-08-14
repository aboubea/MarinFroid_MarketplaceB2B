import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addToCart } from "@/lib/cart";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.organizationId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const { productId, quantity } = await request.json();
  if (!productId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const result = await addToCart(session.organizationId, session.userId, productId, quantity);
  const count = result.items.reduce((sum, i) => sum + i.quantity, 0);
  return NextResponse.json({ ok: true, count });
}
