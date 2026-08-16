"use client";

import { createContext, useContext } from "react";

interface Branding {
  logoUrl: string | null;
  authImageUrl: string | null;
  authImageZoom: number;
  authImagePositionX: number;
  authImagePositionY: number;
}

const defaultBranding: Branding = {
  logoUrl: null,
  authImageUrl: null,
  authImageZoom: 100,
  authImagePositionX: 50,
  authImagePositionY: 50,
};

const BrandingContext = createContext<Branding>(defaultBranding);

export function BrandingProvider({ branding, children }: { branding: Partial<Branding>; children: React.ReactNode }) {
  return <BrandingContext.Provider value={{ ...defaultBranding, ...branding }}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
