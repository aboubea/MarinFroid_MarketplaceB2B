import type { CSSProperties } from "react";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(hex: string): Rgb | null {
  const clean = hex.trim().replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const part = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Darken toward black by `amount` (0-1). Used for :hover states. */
function darken(rgb: Rgb, amount: number): Rgb {
  return { r: rgb.r * (1 - amount), g: rgb.g * (1 - amount), b: rgb.b * (1 - amount) };
}

/** Mix toward white by `amount` (0-1). Used for soft tinted backgrounds. */
function tint(rgb: Rgb, amount: number): Rgb {
  return {
    r: rgb.r + (255 - rgb.r) * amount,
    g: rgb.g + (255 - rgb.g) * amount,
    b: rgb.b + (255 - rgb.b) * amount,
  };
}

function rgba({ r, g, b }: Rgb, alpha: number): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

/**
 * Turns the two colours stored in branding_settings into the full set of
 * derived CSS custom properties the design system uses (hover states, soft
 * tinted backgrounds, coloured CTA glows), so changing a colour in the admin
 * actually repaints the app instead of only affecting the two base tokens.
 *
 * Returns undefined for an unparseable colour so the CSS defaults stand.
 */
export function buildBrandStyle(primaryColor?: string | null, accentColor?: string | null): CSSProperties | undefined {
  const style: Record<string, string> = {};

  const primary = primaryColor ? parseHex(primaryColor) : null;
  if (primary) {
    style["--color-primary"] = toHex(primary);
    style["--color-primary-hover"] = toHex(darken(primary, 0.16));
    style["--color-primary-soft"] = toHex(tint(primary, 0.9));
    style["--color-secondary"] = toHex(primary);
    style["--shadow-cta"] = `0 2px 8px ${rgba(primary, 0.28)}`;
    style["--shadow-cta-hover"] = `0 8px 22px ${rgba(primary, 0.36)}`;
  }

  const accent = accentColor ? parseHex(accentColor) : null;
  if (accent) {
    style["--color-accent"] = toHex(accent);
    style["--color-accent-hover"] = toHex(darken(accent, 0.14));
    style["--color-accent-soft"] = toHex(tint(accent, 0.9));
    style["--shadow-accent"] = `0 2px 8px ${rgba(accent, 0.3)}`;
    style["--shadow-accent-hover"] = `0 8px 22px ${rgba(accent, 0.38)}`;
  }

  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}
