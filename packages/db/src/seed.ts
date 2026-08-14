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
    {
      categoryId: cat1.id, sku: "POI-001", name: "Filet de cabillaud", unit: "kg",
      origin: "Atlantique Nord", packaging: "Carton 5kg", indicativePrice: "42.50",
      storageTemp: "Sous 0/4°C", shelfLife: "24 mois (surgelé)",
      description: "Filets de cabillaud sans peau, sans arêtes, surgelés individuellement pour une utilisation à la demande.",
      nutritionalInfo: "Énergie 82 kcal/344 kJ · Matières grasses 0,7g · Glucides 0g · Protéines 18g · Sel 0,2g",
    },
    {
      categoryId: cat1.id, sku: "POI-002", name: "Pavé de saumon", unit: "kg",
      origin: "Norvège", packaging: "Carton 5kg", indicativePrice: "34.80",
      storageTemp: "Sous 0/4°C", shelfLife: "18 mois (surgelé)",
      description: "Pavés de saumon avec peau, calibre régulier, idéal cuisson four ou plancha.",
      nutritionalInfo: "Énergie 208 kcal/870 kJ · Matières grasses 13g · Glucides 0g · Protéines 20g · Sel 0,1g",
    },
    {
      categoryId: cat2.id, sku: "CRU-001", name: "Crevettes entières crues", unit: "kg",
      origin: "Madagascar", packaging: "Carton 2kg", indicativePrice: "18.90",
      storageTemp: "Sous -18°C", shelfLife: "12 mois (surgelé)",
      description: "Crevettes entières crues, calibre 30/40, décongélation rapide.",
      nutritionalInfo: "Énergie 85 kcal/357 kJ · Matières grasses 0,8g · Glucides 0,5g · Protéines 19g · Sel 1,2g",
    },
    {
      categoryId: cat2.id, sku: "CRU-002", name: "Noix de Saint-Jacques", unit: "kg",
      origin: "Manche", packaging: "Sachet 1kg", indicativePrice: "28.60",
      storageTemp: "Sous -18°C", shelfLife: "10 mois (surgelé)",
      description: "Noix de Saint-Jacques sans corail, calibre 10/20, IQF.",
      nutritionalInfo: "Énergie 88 kcal/369 kJ · Matières grasses 0,6g · Glucides 3g · Protéines 17g · Sel 0,3g",
    },
  ]);

  console.log("Seed complete. Demo login: acheteur@demo.fr / ChangeMe123!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
