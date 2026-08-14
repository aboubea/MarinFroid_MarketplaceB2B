import { eq, inArray } from "drizzle-orm";
import { createDb } from "./index";
import { productCategories, products } from "./schema";

interface CategorySeed {
  name: string;
  slug: string;
  position: number;
}

interface ProductSeed {
  sku: string;
  name: string;
  categorySlug: string;
  origin: string; // manufacturer/brand
  packaging: string;
  indicativePrice: string;
  description: string;
}

const CATEGORIES: CategorySeed[] = [
  { name: "Laverie", slug: "laverie", position: 1 },
  { name: "Four", slug: "four", position: 2 },
  { name: "Traitement de l'eau", slug: "traitement-de-leau", position: 3 },
];

const PRODUCTS: ProductSeed[] = [
  // --- Laverie ---
  { sku: "W41-20006021", name: "Détergent F300 - 5L", categorySlug: "laverie", origin: "Winterhalter", packaging: "5L / 6,2kg", indicativePrice: "51.00", description: "Détergent liquide qui aide à éliminer les dépôts de calcaire et redonner aux tasses leur aspect brillant. Convient aux lave-vaisselles frontaux et à capot professionnels (restaurants, hôtels, restauration commerciale)." },
  { sku: "W41-20006022", name: "Détergent F300 - 10L", categorySlug: "laverie", origin: "Winterhalter", packaging: "10L", indicativePrice: "80.00", description: "Détergent liquide qui aide à éliminer les dépôts de calcaire et redonner aux tasses leur aspect brillant. Convient aux lave-vaisselles frontaux et à capot professionnels (restaurants, hôtels, restauration commerciale)." },
  { sku: "W41-20006023", name: "Détergent F300 - 20L", categorySlug: "laverie", origin: "Winterhalter", packaging: "20L", indicativePrice: "154.00", description: "Détergent liquide qui aide à éliminer les dépôts de calcaire et redonner aux tasses leur aspect brillant. Convient aux lave-vaisselles frontaux et à capot professionnels (restaurants, hôtels, restauration commerciale)." },
  { sku: "W41-20004401", name: "Détergent polyvalent F420E - 5L", categorySlug: "laverie", origin: "Winterhalter", packaging: "5L", indicativePrice: "57.60", description: "Détergent polyvalent élaboré pour éliminer le besoin d'essuyer les verres après lavage. Formule biodégradable pour lave-verres professionnels Winterhalter, idéal restaurants, hôtels, bars, collectivités." },
  { sku: "W41-20004391", name: "Détergent polyvalent F420E - 10L", categorySlug: "laverie", origin: "Winterhalter", packaging: "10L", indicativePrice: "97.20", description: "Détergent polyvalent élaboré pour éliminer le besoin d'essuyer les verres après lavage. Formule biodégradable pour lave-verres professionnels Winterhalter, idéal restaurants, hôtels, bars, collectivités." },
  { sku: "W41-20004392", name: "Détergent polyvalent F420E - 20L", categorySlug: "laverie", origin: "Winterhalter", packaging: "20L", indicativePrice: "162.17", description: "Détergent polyvalent élaboré pour éliminer le besoin d'essuyer les verres après lavage. Formule biodégradable pour lave-verres professionnels Winterhalter, idéal restaurants, hôtels, bars, collectivités." },
  { sku: "G01-204267", name: "Liquide de rinçage B100N - 5L", categorySlug: "laverie", origin: "Winterhalter", packaging: "5L / 5,1kg", indicativePrice: "54.00", description: "Produit de rinçage neutre hautement concentré, pH neutre, séchage rapide et brillance. Convient à tous les types de lave-vaisselle." },
  { sku: "G01-205793", name: "Liquide de rinçage B100N - 10L", categorySlug: "laverie", origin: "Winterhalter", packaging: "10L", indicativePrice: "80.02", description: "Produit de rinçage neutre hautement concentré, pH neutre, séchage rapide et brillance. Convient à tous les types de lave-vaisselle." },
  { sku: "G01-205794", name: "Liquide de rinçage B100N - 20L", categorySlug: "laverie", origin: "Winterhalter", packaging: "20L", indicativePrice: "150.57", description: "Produit de rinçage neutre hautement concentré, pH neutre, séchage rapide et brillance. Convient à tous les types de lave-vaisselle." },
  { sku: "G01-203031", name: "LM 660 — liquide lavage spécial eau dure", categorySlug: "laverie", origin: "Franstal", packaging: "5L", indicativePrice: "57.51", description: "Détergent liquide destiné au lavage de la vaisselle. Haut pouvoir nettoyant et dégraissant. Préconisé en eaux dures (15-30° TH)." },
  { sku: "G01-203030", name: "LM 560 — liquide lavage spécial eau douce", categorySlug: "laverie", origin: "Franstal", packaging: "5L", indicativePrice: "60.06", description: "Détergent liquide destiné au lavage de la vaisselle. Haut pouvoir nettoyant et dégraissant. Préconisé en eaux douces ou adoucies (0-15° TH)." },
  { sku: "G01-203032", name: "Lave LS+ — liquide lavage spécial verre", categorySlug: "laverie", origin: "Franstal", packaging: "4 x 5L", indicativePrice: "56.22", description: "Haut pouvoir nettoyant pour des verres propres et brillants. Élimination rapide des tâches de café, de vin ou de rouge à lèvres." },
  { sku: "G01-203054", name: "Lave Chlore 755 — liquide lavage chloré toutes eaux", categorySlug: "laverie", origin: "Franstal", packaging: "4 x 5L", indicativePrice: "67.37", description: "Détergent liquide pour le lavage de la vaisselle, efficace sur les graisses animales et salissures colorées grâce à sa teneur en chlore actif. Préconisé pour tous les types de dureté d'eau." },
  { sku: "G01-203029", name: "Pro Rince EDU — liquide rinçage spécial eau dure", categorySlug: "laverie", origin: "Franstal", packaging: "4 x 5L", indicativePrice: "49.71", description: "Liquide de rinçage acide hautement concentré. Neutralise l'alcalinité résiduelle des liquides de lavage et évite les dépôts de calcaire. Préconisé en eaux très dures (> 30° TH)." },
  { sku: "G01-207238", name: "Pro Rince EDU — liquide rinçage spécial eau dure - 20L", categorySlug: "laverie", origin: "Franstal", packaging: "20L", indicativePrice: "49.71", description: "Liquide de rinçage acide hautement concentré. Neutralise l'alcalinité résiduelle des liquides de lavage et évite les dépôts de calcaire. Préconisé en eaux très dures (> 30° TH)." },

  // --- Four ---
  { sku: "F11-56.00.210", name: "Pastille four — nettoyage combiné amortisseurs", categorySlug: "four", origin: "Rational", packaging: "100 tablettes", indicativePrice: "96.00", description: "Tablettes de nettoyage combinées pour amortisseurs, pour tous les Self Cooking Center et Combi Master Plus. Dissolution rapide, élimine graisses, résidus alimentaires et calcaire." },
  { sku: "F11-56.00.562", name: "Tablette Care Tab — rinçage", categorySlug: "four", origin: "Rational", packaging: "150 tablettes", indicativePrice: "113.00", description: "Tablettes de rinçage avec technologie Care Control, pour toute la gamme iCombi Pro, iCombi Classic et SelfCookingCenter. Protège contre les dépôts de tartre, sans adoucissement d'eau ni détartrage manuel." },
  { sku: "F11-56.01.535", name: "Pastille four Active Green — nettoyage", categorySlug: "four", origin: "Rational", packaging: "150 tablettes", indicativePrice: "126.00", description: "Pastilles de nettoyage pour fours iCombi Pro et iCombi Classic. Formulation sans phosphate ni phosphore, jusqu'à 50% d'économie de produit. Nettoyage intermédiaire ultrarapide en env. 12 minutes." },
  { sku: "FR1-CLADL002BC", name: "Combiclean Boosted 3 en 1 - 2x5L", categorySlug: "four", origin: "Franstal", packaging: "2 x 5L", indicativePrice: "94.00", description: "Détergent alcalin triple action pour le nettoyage de la chambre de cuisson : détergent, brillanteur, désincrustant." },
  { sku: "FR1-CLADL001BT", name: "Combiclean Boosted 3 en 1 - 10L", categorySlug: "four", origin: "Franstal", packaging: "10L", indicativePrice: "94.00", description: "Détergent alcalin triple action pour le nettoyage de la chambre de cuisson : détergent, brillanteur, désincrustant." },
  { sku: "FR1-CLACF002BC", name: "Calfree Boosted — anti-calcaire - 2x5L", categorySlug: "four", origin: "Franstal", packaging: "2 x 5L", indicativePrice: "67.00", description: "Produit anticalcaire écologique et non toxique, prévient la formation du calcaire dans le générateur de vapeur." },
  { sku: "FR1-CLACF001BT", name: "Calfree Boosted — anti-calcaire - 10L", categorySlug: "four", origin: "Franstal", packaging: "10L", indicativePrice: "67.00", description: "Produit anticalcaire écologique et non toxique, prévient la formation du calcaire dans le générateur de vapeur." },
  { sku: "G01-203046", name: "Pro Four — dégraissant four et hottes", categorySlug: "four", origin: "Franstal", packaging: "4 x 5L", indicativePrice: "58.09", description: "Dégraissant surpuissant pour l'élimination des graisses cuites et carbonisées sur fours, pianos, grills, hottes, friteuses, plans de travail. Mousse suractive, se rince facilement." },
  { sku: "A44-6028430", name: "Starbright FX — produit de rinçage", categorySlug: "four", origin: "Angelo Po", packaging: "2 x 10L", indicativePrice: "253.00", description: "Produit de rinçage liquide acide tamponné pour le lavage et nettoyage automatique des fours professionnels Angelo Po. Réduit la tension superficielle de l'eau, séchage rapide et uniforme sans traces." },
  { sku: "A44-6028420", name: "Détergent StarcleanFX — produit de lavage", categorySlug: "four", origin: "Angelo Po", packaging: "2 x 10L", indicativePrice: "266.00", description: "Détergent dégraissant alcalin liquide pour le lavage automatique des fours professionnels Angelo Po (Practico modèles TT, Combistar modèles FX3/BXW). Élimine résidus cuits et carbonisés de graisse et protéines." },
  { sku: "U06-DB1016A0", name: "Nettoyant Det&Rinse", categorySlug: "four", origin: "Unox", packaging: "2 x 5L", indicativePrice: "103.00", description: "Détergent conçu pour les fours Unox Cheftop, Bakertop et LinemissTop équipés du Rotor Klean." },

  // --- Traitement de l'eau ---
  { sku: "W41-300117726", name: "Filtre charbon actif AC-M", categorySlug: "traitement-de-leau", origin: "Winterhalter", packaging: "1 unité", indicativePrice: "89.00", description: "Filtre à charbon actif conçu pour garantir une qualité d'eau optimale dans les équipements de lavage. Élimine les impuretés et les odeurs, fonctionnement efficace et prolongé des machines." },
  { sku: "W41-3305017", name: "Sel régénérant Winterhalter", categorySlug: "traitement-de-leau", origin: "Winterhalter", packaging: "Sachet 500g", indicativePrice: "29.00", description: "Sel régénérant conçu pour les lave-vaisselle professionnels équipés d'un adoucisseur d'eau intégré. Haute pureté, régénération optimale des résines adoucissantes." },
  { sku: "B66-1002045", name: "Cartouche Purity C500", categorySlug: "traitement-de-leau", origin: "Brita", packaging: "1 unité", indicativePrice: "172.00", description: "Réduit la dureté carbonatée de l'eau potable, diminue le risque de dépôts calcaires. Retient métaux (plomb, cuivre) et substances altérant goût/odeur. Distributeurs automatiques, machines à café et à glaçons." },
  { sku: "B66-1002063", name: "Cartouche Purity C1000 AC", categorySlug: "traitement-de-leau", origin: "Brita", packaging: "1 unité", indicativePrice: "38.00", description: "Bloc de charbon actif, retient les résidus altérant goût/odeur/aspect, particules jusqu'à 0,5 µm. Pour fontaines à eau connectées au réseau." },
  { sku: "B66-1023328", name: "Cartouche Purity C1100 Steam", categorySlug: "traitement-de-leau", origin: "Brita", packaging: "1 unité", indicativePrice: "252.00", description: "Cartouche de filtration pour fours mixtes vapeur et fours de petite à moyenne taille. Réduit la dureté carbonatée, retient les ions métalliques et le chlore." },
  { sku: "B23-M0812332", name: "Cartouche BestClear 2XL", categorySlug: "traitement-de-leau", origin: "BWT", packaging: "1 unité", indicativePrice: "214.00", description: "Cartouche de déminéralisation partielle pour un rinçage parfait en environnement professionnel. Capacité de 9000 litres (à 10°Kh, bypass 0). Élimine calcaire et particules." },
  { sku: "B23-M0812333", name: "Cartouche BestClear Extra 2XL", categorySlug: "traitement-de-leau", origin: "BWT", packaging: "1 unité", indicativePrice: "214.00", description: "Cartouche optimisée pour lave-vaisselles et lave-verres de restauration, jusqu'à 65°C, 7 niveaux de filtration avec déminéralisation totale. Capacité moyenne de 3300L." },
  { sku: "B23-M0812116", name: "Cartouche BestMax 2XL", categorySlug: "traitement-de-leau", origin: "BWT", packaging: "1 unité", indicativePrice: "252.00", description: "Cartouche filtrante anti-calcaire et chlore polyvalente. Capacité de 8270L (four mixte) à 12000L (machine à café) pour 10°Kh. Machines à café, fours mixtes, distributeurs automatiques." },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const db = createDb(connectionString);

  // Remove the generic demo catalog (safe: onDelete set null on category FK,
  // and these SKUs are the known placeholders created by the original seed).
  const demoSkus = ["EQ-001", "EQ-002", "CONS-001", "CONS-002"];
  await db.delete(products).where(inArray(products.sku, demoSkus));

  const demoSlugs = ["equipements", "consommables-fournitures"];
  await db.delete(productCategories).where(inArray(productCategories.slug, demoSlugs));

  const categoryIdBySlug = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const existing = await db.query.productCategories.findFirst({ where: eq(productCategories.slug, cat.slug) });
    if (existing) {
      categoryIdBySlug.set(cat.slug, existing.id);
      console.log(`Category already exists: ${cat.name}`);
      continue;
    }
    const [created] = await db.insert(productCategories).values(cat).returning();
    categoryIdBySlug.set(cat.slug, created.id);
    console.log(`Category created: ${cat.name}`);
  }

  let created = 0;
  let skipped = 0;
  for (const p of PRODUCTS) {
    const existing = await db.query.products.findFirst({ where: eq(products.sku, p.sku) });
    if (existing) {
      skipped++;
      continue;
    }
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    await db.insert(products).values({
      sku: p.sku,
      name: p.name,
      categoryId: categoryId ?? null,
      unit: "unité",
      origin: p.origin,
      packaging: p.packaging,
      indicativePrice: p.indicativePrice,
      description: p.description,
    });
    created++;
  }

  console.log(`Catalog seeded: ${created} product(s) created, ${skipped} already present.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
