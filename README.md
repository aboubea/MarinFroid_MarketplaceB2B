# Marin Froid — Portail de commande B2B

Portail privé de commande pour les clients (sociétés invitées) de Marin Froid.
Aucun paiement en ligne : les prix affichés sont indicatifs, les commandes sont transmises
directement à l'équipe interne qui confirme le montant définitif.

## Stack

- **apps/web** — Next.js 15 (App Router) + React + TypeScript, police Inter, nav latérale sombre inspirée des maquettes fournies
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
pnpm db:seed        # crée un admin + un client démo + quelques produits avec prix/DLUO/conservation

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
2. Vérifier aussi **Environments → Production → Branch Tracking** (ou l'ancien "Production Branch") : doit pointer sur la branche qui contient le code (actuellement `main`, tenu à jour par fast-forward depuis la branche de dev).
3. Créer un projet Neon, récupérer la chaîne de connexion pooled.
4. Configurer les variables d'environnement dans Vercel : `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `APP_URL`.
5. `apps/web/vercel.json` (lu automatiquement une fois le Root Directory positionné) installe les dépendances depuis la racine du monorepo puis exécute `db:generate` + `db:migrate` avant le build Next.js — la base Neon est donc toujours à jour à chaque déploiement.
6. Le seed (`pnpm db:seed`) n'est **pas** exécuté automatiquement en continu — il a été lancé une fois manuellement contre la base de prod pour créer le compte admin et les données de référence. Ne pas le remettre dans `buildCommand` en continu : il n'est pas idempotent (recréerait des sociétés/produits en double à chaque déploiement).
7. Mobile : configurer `apps/mobile/app.json` → `expo.extra.apiUrl` avec l'URL Vercel de production avant un build EAS.

## Prix et facturation

Les maquettes fournies affichent des prix, un solde de crédit et une section facturation.
Décision retenue (validée avec l'utilisateur) : **affichage informatif uniquement**. Le
catalogue, la fiche produit et le panier montrent un prix/montant indicatif
(`indicativePrice` sur `products`), sans paiement en ligne ni gestion réelle d'un
crédit/plafond d'encours — ce dernier point reste hors MVP tant qu'il n'est pas explicitement demandé.

## Ce qui est prêt à utiliser maintenant

- Auth par invitation (société + contact), activation de compte, login, mot de passe oublié.
- Design : police Inter, ombres/hover/transitions soignées, sidebar avec icônes, cartes avec
  élévation au survol — direction plus proche d'Apple/Airbnb/Spotify que la V1.
- Catalogue avec **recherche texte + filtres par catégorie** (pills), prix indicatif/origine/
  conditionnement, stepper de quantité, ajout au panier avec feedback immédiat (badge animé).
- **Fiche produit détaillée** (`/catalog/[id]`) : prix, conditionnement, conservation, DLUO,
  description, valeurs nutritionnelles, documents téléchargeables (images/documents déjà en
  base via `product_images` / `product_documents`, à alimenter).
- **Adresses de livraison** : gestion complète côté client (page Compte — ajout/suppression/
  adresse par défaut) et sélection de l'adresse au moment de valider la commande.
- Mobile (Expo) : login, tableau de bord (produits habituels + dernières commandes), catalogue,
  panier avec badge sur l'onglet, validation, historique, duplication de commande.
- Panier web en deux colonnes : détail commande + résumé (sélecteur d'adresse, sous-total
  indicatif si des prix sont renseignés).
- Back-office Marin Froid : liste/détail commandes, changement de statut, liste/détail clients, suspension.
- Personnalisation globale : logo + couleurs appliquées à toute l'app, garde-fou de contraste basique.
- Emails transactionnels Resend : invitation, activation, commande créée (client + équipe), changement de statut, reset password.

## Ce qu'il faut encore confirmer

- Nom de domaine expéditeur Resend (DNS/DKIM) et adresse `RESEND_FROM` définitive — voir section dédiée ci-dessous.
- Règles précises de désactivation utilisateur côté admin société (`org_admin`) — actuellement seul Marin Froid peut suspendre une société entière.
- Si un vrai suivi de crédit/encours client doit remplacer l'affichage indicatif actuel.
- Comment alimenter concrètement `product_images` / `product_documents` (upload manuel, import fournisseur, etc.) — l'UI de la fiche produit les affiche déjà si présents.

## Configurer le domaine d'envoi Resend (DNS/DKIM)

1. Dans le dashboard Resend → **Domains** → **Add Domain**, saisir le domaine expéditeur (ex. `marinfroid.fr` ou un sous-domaine dédié `mail.marinfroid.fr`).
2. Resend fournit des enregistrements DNS (SPF, DKIM, éventuellement DMARC) à ajouter chez le registrar/hébergeur DNS du domaine.
3. Une fois les enregistrements propagés (quelques minutes à quelques heures), Resend valide le domaine automatiquement.
4. Mettre à jour `RESEND_FROM` dans les variables d'environnement Vercel avec une adresse `@` de ce domaine (ex. `Marin Froid <commandes@marinfroid.fr>`).
5. Cette étape nécessite un accès à la zone DNS du domaine — à faire par la personne qui gère l'hébergement/domaine de Marin Froid, je ne peux pas la faire depuis cette session.

## Repoussé (chantiers volumineux, hors de cette itération)

- **Back-office étoffé** (vue planning, exports commandes, paramétrage fin des destinataires
  email par type d'événement — maquettes 08/09) : nécessite un vrai module de configuration
  des notifications (table `notification_rules` déjà prévue en base mais pas encore utilisée)
  et une vue d'export — à cadrer comme un chantier à part entière.
- **Rôles secondaires** (comptabilité, utilisateur secondaire, permissions fines pour
  `org_admin` sur les utilisateurs de sa société) : implique de revoir le RBAC actuel
  (5 rôles fixes) vers un système de permissions plus granulaire.
- **QA + build mobile** (tests des parcours critiques en conditions réelles, configuration EAS
  pour un build App Store/Play Store) : nécessite un compte Apple/Google Developer et des tests
  sur device réels, hors de ce que je peux valider depuis cette session.
- **Monitoring / analytics légers** : pas encore mis en place, à définir selon l'outil souhaité
  (Vercel Analytics, Sentry, Plausible...).
