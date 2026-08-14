import type { Metadata } from "next";
import "./globals.css";
import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Marin Froid — Portail commande B2B",
  description: "Portail de commande privé Marin Froid",
};

async function getBrandingStyle() {
  try {
    const db = getDb();
    const branding = await db.query.brandingSettings.findFirst();
    if (!branding) return undefined;
    return {
      "--color-primary": branding.primaryColor,
      "--color-secondary": branding.secondaryColor,
    } as React.CSSProperties;
  } catch {
    return undefined;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brandingStyle = await getBrandingStyle();
  return (
    <html lang="fr">
      <body style={brandingStyle}>{children}</body>
    </html>
  );
}
