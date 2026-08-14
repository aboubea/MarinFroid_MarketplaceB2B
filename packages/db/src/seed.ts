import { createDb } from "./index";
import {
  organizations,
  users,
  productCategories,
  products,
  brandingSettings,
  notificationRecipients,
} from "./schema";
import { randomUUID } from "node:crypto";
import { scryptSync, randomBytes } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const db = createDb(connectionString);

  const [branding] = await db
    .insert(brandingSettings)
    .values({ primaryColor: "#0F172A", secondaryColor: "#38BDF8" })
    .returning();
  console.log("Branding seeded:", branding?.id);

  await db.insert(notificationRecipients).values({
    email: "commandes@marinfroid.fr",
    label: "Équipe commandes",
  });

  const [mfOrg] = await db
    .insert(organizations)
    .values({ name: "Marin Froid", status: "active" })
    .returning();

  await db.insert(users).values({
    email: "admin@marinfroid.fr",
    passwordHash: hashPassword("ChangeMe123!"),
    fullName: "Admin Marin Froid",
    role: "mf_admin",
    organizationId: mfOrg.id,
  });

  const [demoOrg] = await db
    .insert(organizations)
    .values({ name: "Client Démo SARL", status: "active" })
    .returning();

  await db.insert(users).values({
    email: "acheteur@demo.fr",
    passwordHash: hashPassword("ChangeMe123!"),
    fullName: "Acheteur Démo",
    role: "org_buyer",
    organizationId: demoOrg.id,
  });

  const [cat1] = await db
    .insert(productCategories)
    .values({ name: "Poissons", slug: "poissons", position: 1 })
    .returning();
  const [cat2] = await db
    .insert(productCategories)
    .values({ name: "Crustacés", slug: "crustaces", position: 2 })
    .returning();

  await db.insert(products).values([
    { categoryId: cat1.id, sku: "POI-001", name: "Filet de cabillaud", unit: "kg", origin: "Atlantique Nord", packaging: "Carton 5kg", indicativePrice: "42.50" },
    { categoryId: cat1.id, sku: "POI-002", name: "Pavé de saumon", unit: "kg", origin: "Norvège", packaging: "Carton 5kg", indicativePrice: "34.80" },
    { categoryId: cat2.id, sku: "CRU-001", name: "Crevettes entières crues", unit: "kg", origin: "Madagascar", packaging: "Carton 2kg", indicativePrice: "18.90" },
    { categoryId: cat2.id, sku: "CRU-002", name: "Noix de Saint-Jacques", unit: "kg", origin: "Manche", packaging: "Sachet 1kg", indicativePrice: "28.60" },
  ]);

  console.log("Seed complete. Demo login: acheteur@demo.fr / ChangeMe123!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
