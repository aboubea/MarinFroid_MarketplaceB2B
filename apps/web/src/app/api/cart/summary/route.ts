import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";

export async function GET() {
  const session = await getSession();
  if (!session || !session.organizationId) return NextResponse.json({ items: [], count: 0, subtotal: 0 });
  const { items } = await getCartWithItems(session.organizationId, session.userId);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * i.quantity : 0), 0);
  return NextResponse.json({ items, count, subtotal });
}
