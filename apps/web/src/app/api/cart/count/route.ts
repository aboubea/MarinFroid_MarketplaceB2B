import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCartWithItems } from "@/lib/cart";

export async function GET() {
  const session = await getSession();
  if (!session || !session.organizationId) return NextResponse.json({ count: 0 });
  const { items } = await getCartWithItems(session.organizationId, session.userId);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return NextResponse.json({ count });
}
