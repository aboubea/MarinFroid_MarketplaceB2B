# Marin Froid — Portail de commande B2B

Portail privé de commande pour les clients (sociétés invitées) de Marin Froid.
Aucun paiement en ligne : les commandes sont transmises directement à l'équipe interne.

## Stack

- **apps/web** — Next.js 15 (App Router) + React + TypeScript
- **packages/db** — Drizzle ORM + Neon Postgres (schéma, migrations, seed)
- **packages/email** — Resend (templates + client)
- **packages/types** — types métier partagés

`apps/mobile` (Expo/React Native) n'est pas encore scaffoldé dans cette itération — voir "Prochaines étapes".

## Démarrage local

```bash
pnpm install
cp .env.example .env
# renseigner DATABASE_URL (Neon), AUTH_SECRET, RESEND_API_KEY

pnpm db:generate   # génère les migrations SQL depuis le schéma Drizzle
pnpm db:migrate    # applique les migrations sur Neon
pnpm db:seed        # crée un admin + un client démo + quelques produits

pnpm dev            # démarre apps/web sur http://localhost:3000
```

Comptes de démonstration après `pnpm db:seed` :

- Admin Marin Froid : `admin@marinfroid.fr` / `ChangeMe123!`
- Client démo : `acheteur@demo.fr` / `ChangeMe123!`

## Déploiement (Vercel + Neon)

1. Créer un projet Neon, récupérer la chaîne de connexion pooled.
2. Configurer les variables d'environnement dans Vercel : `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `APP_URL`.
3. `vercel.json` exécute automatiquement `db:generate` puis `db:migrate` avant le build Next.js — la base Neon est donc toujours à jour à chaque déploiement.
4. Le seed (`pnpm db:seed`) n'est **pas** exécuté automatiquement en prod — à lancer manuellement une fois pour initialiser les données de référence (branding par défaut, destinataire notifications).

## Ce qui est prêt à coder / utiliser maintenant

- Auth par invitation (société + contact), activation de compte, login, mot de passe oublié.
- Catalogue par catégories, ajout rapide au panier avec feedback immédiat (icône badge).
- Panier, validation de commande, historique, duplication ("recommander à l'identique").
- Back-office Marin Froid : liste/détail commandes, changement de statut, liste/détail clients, suspension.
- Personnalisation globale : logo + couleurs appliquées à toute l'app, garde-fou de contraste basique.
- Emails transactionnels Resend : invitation, activation, commande créée (client + équipe), changement de statut, reset password.

## Ce qu'il faut encore confirmer

- Nom de domaine expéditeur Resend (DNS/DKIM) et adresse `RESEND_FROM` définitive.
- Adresses de livraison par société (table déjà prévue, UI non branchée).
- Règles précises de désactivation utilisateur côté admin société (`org_admin`) — actuellement seul Marin Froid peut suspendre une société entière.

## Repoussé volontairement hors MVP

- Application mobile Expo/React Native (structure `apps/mobile` à ajouter en V2, en réutilisant `packages/types`).
- Recherche/filtres avancés catalogue, documents produits, images produits.
- Paramétrage fin des templates email depuis l'admin (actuellement en dur dans `packages/email`).
- Rôles secondaires détaillés (comptabilité, utilisateur secondaire) au-delà de `org_admin` / `org_buyer`.
- Analytics et monitoring dédiés.
