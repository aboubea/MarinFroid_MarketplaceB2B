import { createDb } from "./index";
import {
  organizations,
  users,
  productCategories,
  products,
  brandingSettings,
  notificationRecipients,
  notificationEventSettings,
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

  await db.insert(notificationEventSettings).values([
    { eventKey: "order_created", label: "Commande créée" },
    { eventKey: "order_status_updated", label: "Changement de statut" },
    { eventKey: "invitation_sent", label: "Invitation envoyée" },
    { eventKey: "account_activated", label: "Compte activé" },
    { eventKey: "password_reset", label: "Réinitialisation mot de passe" },
  ]);

  const [mfOrg] = await db
    .insert(organizations)
    .values({ name: "Marin Froid", status: "active" })
    .returning();

  await db.insert(users).values([
    {
      email: "admin@marinfroid.fr",
      passwordHash: hashPassword("ChangeMe123!"),
      fullName: "Admin Marin Froid",
      role: "mf_admin",
      organizationId: mfOrg.id,
    },
    {
      email: "preparation@marinfroid.fr",
      passwordHash: hashPassword("ChangeMe123!"),
      fullName: "Équipe Préparation",
      role: "mf_ops",
      organizationId: mfOrg.id,
    },
  ]);

  const [demoOrg] = await db
    .insert(organizations)
    .values({ name: "Client Démo SARL", status: "active" })
    .returning();

  await db.insert(users).values([
    {
      email: "acheteur@demo.fr",
      passwordHash: hashPassword("ChangeMe123!"),
      fullName: "Acheteur Démo",
      role: "org_buyer",
      organizationId: demoOrg.id,
    },
    {
      email: "compta@demo.fr",
      passwordHash: hashPassword("ChangeMe123!"),
      fullName: "Comptabilité Démo",
      role: "org_viewer",
      organizationId: demoOrg.id,
    },
  ]);

  // Catégories et références volontairement génériques : le catalogue réel de Marin Froid
  // (cuisiniste pour la restauration professionnelle et la restauration collective) n'a pas
  // encore été communiqué. À remplacer par le vrai catalogue dès qu'il est disponible.
  const [cat1] = await db
    .insert(productCategories)
    .values({ name: "Équipements", slug: "equipements", position: 1 })
    .returning();
  const [cat2] = await db
    .insert(productCategories)
    .values({ name: "Consommables & fournitures", slug: "consommables-fournitures", position: 2 })
    .returning();

  await db.insert(products).values([
    {
      categoryId: cat1.id, sku: "EQ-001", name: "Référence d'équipement A", unit: "unité",
      packaging: "Unité", indicativePrice: "0.00",
      description: "Fiche de démonstration — à remplacer par une référence réelle du catalogue Marin Froid.",
    },
    {
      categoryId: cat1.id, sku: "EQ-002", name: "Référence d'équipement B", unit: "unité",
      packaging: "Unité", indicativePrice: "0.00",
      description: "Fiche de démonstration — à remplacer par une référence réelle du catalogue Marin Froid.",
    },
    {
      categoryId: cat2.id, sku: "CONS-001", name: "Référence de consommable A", unit: "unité",
      packaging: "Lot", indicativePrice: "0.00",
      description: "Fiche de démonstration — à remplacer par une référence réelle du catalogue Marin Froid.",
    },
    {
      categoryId: cat2.id, sku: "CONS-002", name: "Référence de consommable B", unit: "unité",
      packaging: "Lot", indicativePrice: "0.00",
      description: "Fiche de démonstration — à remplacer par une référence réelle du catalogue Marin Froid.",
    },
  ]);

  console.log("Seed complete. Demo logins (all ChangeMe123!):");
  console.log("  admin@marinfroid.fr        (mf_admin — dashboard Administration)");
  console.log("  preparation@marinfroid.fr  (mf_ops — dashboard Préparation)");
  console.log("  acheteur@demo.fr           (org_buyer — dashboard client)");
  console.log("  compta@demo.fr             (org_viewer — lecture / administratif)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
