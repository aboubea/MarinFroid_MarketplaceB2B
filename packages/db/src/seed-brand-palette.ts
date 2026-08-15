import { eq } from "drizzle-orm";
import { createDb } from "./index";
import { brandingSettings } from "./schema";

/** Legacy defaults shipped before the design-system refresh. */
const LEGACY_PRIMARY = "#0F172A";
const LEGACY_SECONDARY = "#38BDF8";

const NEW_PRIMARY = "#0E7C7B";
const NEW_SECONDARY = "#FF5A4E";

/**
 * Moves the branding row off the old navy/sky defaults onto the new
 * action/accent palette. Deliberately only touches rows still sitting on the
 * legacy values, so a colour an admin actually chose is never overwritten.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const db = createDb(connectionString);

  const branding = await db.query.brandingSettings.findFirst();
  if (!branding) {
    await db.insert(brandingSettings).values({ primaryColor: NEW_PRIMARY, secondaryColor: NEW_SECONDARY });
    console.log("Branding row created with the new palette.");
    return;
  }

  const updates: { primaryColor?: string; secondaryColor?: string } = {};
  if (branding.primaryColor?.toUpperCase() === LEGACY_PRIMARY) updates.primaryColor = NEW_PRIMARY;
  if (branding.secondaryColor?.toUpperCase() === LEGACY_SECONDARY) updates.secondaryColor = NEW_SECONDARY;

  if (Object.keys(updates).length === 0) {
    console.log("Branding colours are custom or already migrated — left untouched.");
    return;
  }

  await db.update(brandingSettings).set(updates).where(eq(brandingSettings.id, branding.id));
  console.log("Branding palette migrated:", updates);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
