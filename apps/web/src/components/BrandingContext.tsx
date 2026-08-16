"use client";

import { createContext, useContext } from "react";

const BrandingContext = createContext<{ logoUrl: string | null }>({ logoUrl: null });

export function BrandingProvider({ logoUrl, children }: { logoUrl: string | null; children: React.ReactNode }) {
  return <BrandingContext.Provider value={{ logoUrl }}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
