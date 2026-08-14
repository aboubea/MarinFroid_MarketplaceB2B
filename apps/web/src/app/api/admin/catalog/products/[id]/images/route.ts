import { NextResponse } from "next/server";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { productImages } from "@marin-froid/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "URL requise." }, { status: 400 });

  const db = getDb();
  const [image] = await db.insert(productImages).values({ productId: id, url }).returning();
  return NextResponse.json({ image });
}
