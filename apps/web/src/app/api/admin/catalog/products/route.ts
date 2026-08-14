import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { products, productCategories } from "@marin-froid/db";
import { logActivity } from "@/lib/activity";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const list = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      unit: products.unit,
      indicativePrice: products.indicativePrice,
      active: products.active,
      categoryId: products.categoryId,
      categoryName: productCategories.name,
    })
    .from(products)
    .leftJoin(productCategories, eq(productCategories.id, products.categoryId))
    .orderBy(desc(products.createdAt));

  return NextResponse.json({ products: list });
}

export async function POST(request: Request) {
  const session = await requireMarinFroidSession();
  const body = await request.json();
  const { sku, name, categoryId, unit, origin, packaging, indicativePrice, storageInfo, validityInfo, specifications, description } = body;

  if (!sku || !name) {
    return NextResponse.json({ error: "Référence et nom requis." }, { status: 400 });
  }

  const db = getDb();
  const existing = await db.query.products.findFirst({ where: eq(products.sku, sku) });
  if (existing) {
    return NextResponse.json({ error: "Cette référence existe déjà." }, { status: 400 });
  }

  const [product] = await db
    .insert(products)
    .values({
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
    })
    .returning();

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    action: "product_created",
    entityType: "product",
    entityId: product.id,
    summary: `Produit « ${product.name} » (${product.sku}) créé`,
  });

  return NextResponse.json({ product });
}
