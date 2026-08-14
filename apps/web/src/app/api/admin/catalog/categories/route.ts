import { NextResponse } from "next/server";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { productCategories } from "@marin-froid/db";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const categories = await db.query.productCategories.findMany({ orderBy: (c, { asc }) => [asc(c.position)] });
  return NextResponse.json({ categories });
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  await requireMarinFroidSession();
  const { name, position } = await request.json();
  if (!name) return NextResponse.json({ error: "Nom requis." }, { status: 400 });

  const db = getDb();
  const [category] = await db
    .insert(productCategories)
    .values({ name, slug: slugify(name), position: position ?? 0 })
    .returning();

  return NextResponse.json({ category });
}
