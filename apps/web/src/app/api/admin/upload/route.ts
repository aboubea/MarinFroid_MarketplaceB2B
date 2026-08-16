import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireMarinFroidSession } from "@/lib/session-guard";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const ALLOWED_FOLDERS = ["branding", "products"];

export async function POST(request: Request) {
  await requireMarinFroidSession();

  // Vercel Blob authenticates either via a static BLOB_READ_WRITE_TOKEN or,
  // for stores connected in OIDC mode, via BLOB_STORE_ID + the runtime's
  // OIDC token (no static token is ever set in that mode).
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return NextResponse.json(
      { error: "Le stockage Vercel Blob n'est pas configuré (aucun store connecté au projet)." },
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

  try {
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    return NextResponse.json({ error: `Échec de l'upload vers Vercel Blob : ${message}` }, { status: 500 });
  }
}
