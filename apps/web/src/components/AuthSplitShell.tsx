"use client";

import { useEffect, useState } from "react";

export function AuthSplitShell({
  headline,
  description,
  children,
}: {
  headline: string;
  description: string;
  children: React.ReactNode;
}) {
  const [authImageUrl, setAuthImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/branding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authImageUrl) setAuthImageUrl(data.authImageUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="login-split">
      <div
        className="login-split-brand"
        style={{
          background: authImageUrl
            ? `linear-gradient(180deg, rgba(11,18,32,0.35) 0%, rgba(11,18,32,0.75) 100%), url(${authImageUrl}) center/cover no-repeat`
            : "linear-gradient(160deg, #0B1220 0%, #0F172A 55%, #14213A 100%)",
          color: "#fff",
          padding: "64px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
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
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 12, maxWidth: 380 }}>
            {headline}
          </h1>
          <p style={{ fontSize: 14, color: "#94A3B8", maxWidth: 340, lineHeight: 1.6 }}>{description}</p>
        </div>

        <div style={{ position: "relative", fontSize: 12, color: "#64748B" }}>
          Accès réservé aux sociétés autorisées.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>{children}</div>
      </div>
    </main>
  );
}
