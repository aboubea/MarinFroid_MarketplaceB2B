import { NextResponse } from "next/server";
import { eq, ne, and } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { products, productImages, productDocuments } from "@marin-froid/db";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const db = getDb();

  const product = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  const [images, documents] = await Promise.all([
    db.query.productImages.findMany({ where: eq(productImages.productId, id) }),
    db.query.productDocuments.findMany({ where: eq(productDocuments.productId, id) }),
  ]);

  return NextResponse.json({ product, images, documents });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidSession();
  const body = await request.json();
  const { sku, name, categoryId, unit, origin, packaging, indicativePrice, storageInfo, validityInfo, specifications, description, active } = body;

  if (!sku || !name) {
    return NextResponse.json({ error: "Référence et nom requis." }, { status: 400 });
  }

  const db = getDb();
  const duplicate = await db.query.products.findFirst({ where: and(eq(products.sku, sku), ne(products.id, id)) });
  if (duplicate) {
    return NextResponse.json({ error: "Cette référence existe déjà sur un autre produit." }, { status: 400 });
  }

  await db
    .update(products)
    .set({
      sku,
      name,
      categoryId: categoryId || null,
      unit: unit || "unité",
      origin: origin || null,
      packaging: packaging || null,
      indicativePrice: indicativePrice || null,
      storageInfo: storageInfo || null,
      validityInfo: validityInfo || null,
      specifications: specifications || null,
      description: description || null,
      active: active ?? true,
    })
    .where(eq(products.id, id));

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    action: "product_updated",
    entityType: "product",
    entityId: id,
    summary: `Produit « ${name} » (${sku}) modifié`,
  });

  return NextResponse.json({ ok: true });
}
