import { NextResponse } from "next/server";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { productDocuments } from "@marin-froid/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const { label, url } = await request.json();
  if (!label || !url) return NextResponse.json({ error: "Libellé et URL requis." }, { status: 400 });

  const db = getDb();
  const [document] = await db.insert(productDocuments).values({ productId: id, label, url }).returning();
  return NextResponse.json({ document });
}
