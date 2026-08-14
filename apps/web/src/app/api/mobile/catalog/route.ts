import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";
import { products, productCategories } from "@marin-froid/db";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const db = getDb();
  const categories = await db.query.productCategories.findMany({ orderBy: (c, { asc }) => [asc(c.position)] });
  const allProducts = await db.query.products.findMany({ where: eq(products.active, true) });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      products: allProducts.filter((p) => p.categoryId === c.id).map((p) => ({ id: p.id, name: p.name, sku: p.sku, unit: p.unit })),
    })),
  });
}
