# Marin Froid — Portail de commande B2B

Portail privé de commande pour les clients (sociétés invitées) de Marin Froid.
Aucun paiement en ligne : les prix affichés sont indicatifs, les commandes sont transmises
directement à l'équipe interne qui confirme le montant définitif.

## Stack

- **apps/web** — Next.js 15 (App Router) + React + TypeScript, nav latérale sombre inspirée des maquettes fournies
- **apps/mobile** — Expo + React Native + TypeScript (auth par token, mêmes parcours client que le web)
- **packages/db** — Drizzle ORM + Neon Postgres (schéma, migrations, seed)
- **packages/email** — Resend (templates + client)
- **packages/types** — types métier partagés

## Démarrage local

```bash
pnpm install
cp .env.example .env
# renseigner DATABASE_URL (Neon), AUTH_SECRET, RESEND_API_KEY

pnpm db:generate   # génère les migrations SQL depuis le schéma Drizzle
pnpm db:migrate    # applique les migrations sur Neon
pnpm db:seed        # crée un admin + un client démo + quelques produits avec prix indicatifs

pnpm dev            # démarre apps/web sur http://localhost:3000

# mobile (nécessite le web lancé, ou APP_URL pointant vers un déploiement) :
cd apps/mobile && pnpm start
```

Comptes de démonstration après `pnpm db:seed` :

- Admin Marin Froid : `admin@marinfroid.fr` / `ChangeMe123!`
- Client démo : `acheteur@demo.fr` / `ChangeMe123!`

## Déploiement (Vercel + Neon)

Ceci est un monorepo pnpm : Vercel doit pointer sur `apps/web`, pas sur la racine du repo,
sinon il ne détecte pas Next.js (erreur "No Next.js version detected").

1. Dans les réglages du projet Vercel → **Settings → General → Root Directory**, définir `apps/web`.
2. Créer un projet Neon, récupérer la chaîne de connexion pooled.
3. Configurer les variables d'environnement dans Vercel : `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `APP_URL`.
4. `apps/web/vercel.json` (lu automatiquement une fois le Root Directory positionné) installe les dépendances depuis la racine du monorepo puis exécute `db:generate` + `db:migrate` avant le build Next.js — la base Neon est donc toujours à jour à chaque déploiement.
5. Le seed (`pnpm db:seed`) n'est **pas** exécuté automatiquement en prod — à lancer manuellement une fois (en local, avec le `DATABASE_URL` de prod) pour initialiser les données de référence (branding par défaut, destinataire notifications).
6. Mobile : configurer `apps/mobile/app.json` → `expo.extra.apiUrl` avec l'URL Vercel de production avant un build EAS.

## Prix et facturation

Les maquettes fournies affichent des prix, un solde de crédit et une section facturation.
Décision retenue pour cette itération (validée avec l'utilisateur) : **affichage informatif
uniquement**. Le catalogue et le panier montrent un prix/montant indicatif (`indicativePrice`
sur `products`), sans paiement en ligne ni gestion réelle d'un crédit/plafond d'encours — ce
dernier point reste hors MVP.

## Ce qui est prêt à coder / utiliser maintenant

- Auth par invitation (société + contact), activation de compte, login, mot de passe oublié.
- Web : nav latérale sombre, catalogue par catégories avec prix indicatif/origine/conditionnement
  et stepper de quantité, ajout au panier avec feedback immédiat (icône badge animée).
- Mobile (Expo) : login, tableau de bord (produits habituels + dernières commandes), catalogue,
  panier avec badge sur l'onglet, validation, historique, duplication de commande.
- Panier web en deux colonnes avec résumé (sous-total indicatif) quand des prix sont renseignés.
- Back-office Marin Froid : liste/détail commandes, changement de statut, liste/détail clients, suspension.
- Personnalisation globale : logo + couleurs appliquées à toute l'app, garde-fou de contraste basique.
- Emails transactionnels Resend : invitation, activation, commande créée (client + équipe), changement de statut, reset password.

## Ce qu'il faut encore confirmer

- Nom de domaine expéditeur Resend (DNS/DKIM) et adresse `RESEND_FROM` définitive.
- Adresses de livraison par société (table déjà prévue, UI non branchée).
- Règles précises de désactivation utilisateur côté admin société (`org_admin`) — actuellement seul Marin Froid peut suspendre une société entière.
- Si un vrai suivi de crédit/encours client doit être construit (actuellement affichage indicatif uniquement).

## Repoussé volontairement hors MVP

- Fiche produit détaillée dédiée, back-office avec planning/facturation/paramétrage fin des emails (maquettes 04, 08, 09) — nav et back-office actuels restent volontairement plus sobres.
- Recherche/filtres avancés catalogue, documents produits, images produits.
- Paramétrage fin des templates email depuis l'admin (actuellement en dur dans `packages/email`).
- Rôles secondaires détaillés (comptabilité, utilisateur secondaire) au-delà de `org_admin` / `org_buyer`.
- Gestion réelle d'un crédit/plafond d'encours et facturation.
- Analytics et monitoring dédiés.
- Build EAS / stores pour le mobile (le scaffold Expo tourne en dev, pas encore configuré pour un déploiement store).
