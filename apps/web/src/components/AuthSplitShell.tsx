"use client";

import { useBranding } from "./BrandingContext";
import { useTransparentLogo } from "@/lib/strip-image-background";

export function AuthSplitShell({
  headline,
  description,
  children,
}: {
  headline: string;
  description: string;
  children: React.ReactNode;
}) {
  const { logoUrl, authImageUrl, authImageZoom, authImagePositionX, authImagePositionY } = useBranding();
  const transparentLogoUrl = useTransparentLogo(logoUrl);

  return (
    <main className="login-split">
      <div
        className="login-split-brand"
        style={{
          backgroundColor: "#0B1220",
          backgroundImage: authImageUrl
            ? `linear-gradient(180deg, rgba(11,18,32,0.35) 0%, rgba(11,18,32,0.75) 100%), url(${authImageUrl})`
            : "linear-gradient(160deg, #0B1220 0%, #0F172A 55%, #14213A 100%)",
          backgroundSize: authImageUrl ? `cover, ${authImageZoom}%` : undefined,
          backgroundPosition: authImageUrl ? `center, ${authImagePositionX}% ${authImagePositionY}%` : undefined,
          backgroundRepeat: "no-repeat",
          color: "#fff",
          padding: "64px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!authImageUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 80% 20%, rgba(56,189,248,0.16), transparent 55%), radial-gradient(circle at 10% 90%, rgba(56,189,248,0.10), transparent 45%)",
            }}
          />
        )}
        <div className="login-split-copy" style={{ position: "relative" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 12, maxWidth: 380 }}>
            {headline}
          </h1>
          <p style={{ fontSize: 14, color: "#94A3B8", maxWidth: 340, lineHeight: 1.6 }}>{description}</p>
        </div>

        <div className="login-split-footnote" style={{ position: "absolute", left: 56, right: 56, bottom: 28, fontSize: 12, color: "#64748B" }}>
          Accès réservé aux sociétés autorisées.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={transparentLogoUrl ?? logoUrl} alt="Marin Froid" className="login-form-logo" style={{ height: 64, width: "auto", maxWidth: 320, objectFit: "contain", display: "block", margin: "0 auto 32px" }} />
          )}
          {children}
        </div>
      </div>
    </main>
  );
}
