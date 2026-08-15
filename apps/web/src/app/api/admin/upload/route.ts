import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireMarinFroidSession } from "@/lib/session-guard";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const ALLOWED_FOLDERS = ["branding", "products"];

export async function POST(request: Request) {
  await requireMarinFroidSession();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Le stockage Vercel Blob n'est pas configuré (BLOB_READ_WRITE_TOKEN manquant)." },
      { status: 500 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis." }, { status: 400 });
  }
  const folderInput = formData?.get("folder");
  const folder = typeof folderInput === "string" && ALLOWED_FOLDERS.includes(folderInput) ? folderInput : "branding";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format non supporté (PNG, JPEG, WebP ou SVG uniquement)." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (5 Mo max)." }, { status: 400 });
  }

  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
