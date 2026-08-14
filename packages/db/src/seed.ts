import { createDb } from "./index";
import {
  organizations,
  users,
  brandingSettings,
  notificationRecipients,
  notificationEventSettings,
} from "./schema";
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
      email: "responsable@demo.fr",
      passwordHash: hashPassword("ChangeMe123!"),
      fullName: "Responsable Démo",
      role: "org_admin",
      organizationId: demoOrg.id,
    },
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

  console.log("Seed complete. Run `pnpm db:seed:catalog` next to load the real product catalog.");
  console.log("Demo logins (all ChangeMe123!):");
  console.log("  admin@marinfroid.fr        (mf_admin — dashboard Administration)");
  console.log("  preparation@marinfroid.fr  (mf_ops — dashboard Préparation)");
  console.log("  responsable@demo.fr        (org_admin — dashboard client, gère l'équipe)");
  console.log("  acheteur@demo.fr           (org_buyer — dashboard client)");
  console.log("  compta@demo.fr             (org_viewer — lecture / administratif)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
