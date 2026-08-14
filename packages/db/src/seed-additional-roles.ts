import { eq } from "drizzle-orm";
import { createDb } from "./index";
import { organizations, users } from "./schema";
import { scryptSync, randomBytes } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function ensureUser(
  db: ReturnType<typeof createDb>,
  params: { email: string; fullName: string; role: "mf_ops" | "org_admin" | "org_viewer"; organizationId: string }
) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, params.email) });
  if (existing) {
    console.log(`Skipped (already exists): ${params.email}`);
    return;
  }
  await db.insert(users).values({
    email: params.email,
    passwordHash: hashPassword("ChangeMe123!"),
    fullName: params.fullName,
    role: params.role,
    organizationId: params.organizationId,
  });
  console.log(`Created: ${params.email}`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const db = createDb(connectionString);

  const mfOrg = await db.query.organizations.findFirst({ where: eq(organizations.name, "Marin Froid") });
  const demoOrg = await db.query.organizations.findFirst({ where: eq(organizations.name, "Client Démo SARL") });

  if (!mfOrg || !demoOrg) {
    throw new Error("Expected organizations 'Marin Froid' and 'Client Démo SARL' to already exist. Run the full seed first.");
  }

  await ensureUser(db, { email: "preparation@marinfroid.fr", fullName: "Équipe Préparation", role: "mf_ops", organizationId: mfOrg.id });
  await ensureUser(db, { email: "responsable@demo.fr", fullName: "Responsable Démo", role: "org_admin", organizationId: demoOrg.id });
  await ensureUser(db, { email: "compta@demo.fr", fullName: "Comptabilité Démo", role: "org_viewer", organizationId: demoOrg.id });

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
