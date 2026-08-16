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

async function getBranding() {
  try {
    const db = getDb();
    const branding = await db.query.brandingSettings.findFirst();
    if (!branding) return { style: undefined, logoUrl: null };
    return { style: buildBrandStyle(branding.primaryColor, branding.secondaryColor), logoUrl: branding.logoUrl ?? null };
  } catch {
    return { style: undefined, logoUrl: null };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { style: brandingStyle, logoUrl } = await getBranding();
  return (
    <html lang="fr" className={inter.variable}>
      <body style={brandingStyle}>
        <BrandingProvider logoUrl={logoUrl}>
          <ToastProvider>{children}</ToastProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
