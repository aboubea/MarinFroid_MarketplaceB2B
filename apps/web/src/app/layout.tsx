import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getDb } from "@/lib/db";
import { ToastProvider } from "@/components/Toast";
import { BrandingProvider } from "@/components/BrandingContext";
import { buildBrandStyle } from "@/lib/brand-theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Marin Froid — Portail commande B2B",
  description: "Portail de commande privé Marin Froid",
};

// Static pages under this layout (login, forgot-password...) read no
// cookies, so without this the branding query below gets baked in at
// build time and never reflects changes made afterwards in the admin.
export const dynamic = "force-dynamic";

async function getBranding() {
  try {
    const db = getDb();
    const branding = await db.query.brandingSettings.findFirst();
    if (!branding) return { style: undefined, logoUrl: null, authImageUrl: null, authImageZoom: 100, authImagePositionX: 50, authImagePositionY: 50 };
    return {
      style: buildBrandStyle(branding.primaryColor, branding.secondaryColor),
      logoUrl: branding.logoUrl ?? null,
      authImageUrl: branding.authImageUrl ?? null,
      authImageZoom: branding.authImageZoom ?? 100,
      authImagePositionX: branding.authImagePositionX ?? 50,
      authImagePositionY: branding.authImagePositionY ?? 50,
    };
  } catch {
    return { style: undefined, logoUrl: null, authImageUrl: null, authImageZoom: 100, authImagePositionX: 50, authImagePositionY: 50 };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { style: brandingStyle, ...branding } = await getBranding();
  return (
    <html lang="fr" className={inter.variable}>
      <body style={brandingStyle}>
        <BrandingProvider branding={branding}>
          <ToastProvider>{children}</ToastProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
