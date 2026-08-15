# Marin Froid — Portail de commande B2B

Portail privé de commande pour les clients (sociétés invitées) de Marin Froid, cuisiniste pour
les professionnels (restaurants, restauration collective). Aucun paiement en ligne : les prix
affichés sont indicatifs, les commandes sont transmises directement à l'équipe interne qui
confirme le montant définitif.

**Catalogue** : le vrai catalogue (34 références, 3 catégories — Laverie, Four, Traitement de
l'eau) est chargé via `pnpm db:seed:catalog` (`packages/db/src/seed-catalog.ts`), extrait d'un
document fournisseur transmis par l'utilisateur. Les prix HT et références sont ceux du
document d'origine ; le nom du fournisseur/document n'apparaît nulle part sur la plateforme,
seul le vendeur Marin Froid est visible côté client. Le script est idempotent (skip les
références déjà présentes) et peut être relancé sans risque de doublon.

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
pnpm db:seed        # crée les organisations/comptes de base (admin, préparation, acheteur, lecture)
pnpm db:seed:catalog # charge le vrai catalogue (34 références) — idempotent, peut être relancé

pnpm dev            # démarre apps/web sur http://localhost:3000

# mobile (nécessite le web lancé, ou APP_URL pointant vers un déploiement) :
cd apps/mobile && pnpm start
```

Comptes de démonstration après `pnpm db:seed` (mot de passe `ChangeMe123!` partout), un par
rôle pour tester les 3 dashboards :

- `admin@marinfroid.fr` (`mf_admin`) → dashboard **Administration** (`/admin/overview`)
- `preparation@marinfroid.fr` (`mf_ops`) → dashboard **Préparation** (`/admin`)
- `acheteur@demo.fr` (`org_buyer`) → dashboard **client** (`/dashboard`)
- `compta@demo.fr` (`org_viewer`, lecture/administratif) → même dashboard client, mais sans pouvoir valider de commande

## Déploiement (Vercel + Neon)

Ceci est un monorepo pnpm : Vercel doit pointer sur `apps/web`, pas sur la racine du repo,
sinon il ne détecte pas Next.js (erreur "No Next.js version detected").

1. Dans les réglages du projet Vercel → **Settings → General → Root Directory**, définir `apps/web`.
2. Vérifier aussi **Environments → Production → Branch Tracking** (ou l'ancien "Production Branch") : doit pointer sur la branche qui contient le code (actuellement `main`, tenu à jour par fast-forward depuis la branche de dev).
3. Créer un projet Neon, récupérer la chaîne de connexion pooled.
4. Configurer les variables d'environnement dans Vercel : `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `APP_URL`, et optionnellement `CRON_SECRET` (protège `/api/cron/deliveries`, le job quotidien qui marque automatiquement les commandes expédiées comme livrées une fois la date de livraison estimée atteinte — voir `apps/web/vercel.json` → `crons`).
5. `apps/web/vercel.json` (lu automatiquement une fois le Root Directory positionné) installe les dépendances depuis la racine du monorepo puis exécute `db:generate` + `db:migrate` avant le build Next.js — la base Neon est donc toujours à jour à chaque déploiement.
6. Le seed (`pnpm db:seed`) n'est **pas** exécuté automatiquement en continu — il a été lancé une fois manuellement contre la base de prod pour créer le compte admin et les données de référence. Ne pas le remettre dans `buildCommand` en continu : il n'est pas idempotent (recréerait des sociétés/produits en double à chaque déploiement).
7. Mobile : configurer `apps/mobile/app.json` → `expo.extra.apiUrl` avec l'URL Vercel de production avant un build EAS.
8. Upload du logo (page Branding) : dans le projet Vercel → **Storage → Create Database → Blob**, créer un store — Vercel injecte automatiquement la variable `BLOB_READ_WRITE_TOKEN` sur le projet (aucune valeur à copier manuellement). Sans cette variable, l'upload de fichier échoue proprement (message d'erreur explicite) mais le champ URL du logo reste utilisable en solution de repli.

## Prix et facturation

Les maquettes fournies affichent des prix, un solde de crédit et une section facturation.
Décision retenue (validée avec l'utilisateur) : **affichage informatif uniquement**. Le
catalogue, la fiche produit et le panier montrent un prix/montant indicatif
(`indicativePrice` sur `products`), sans paiement en ligne ni gestion réelle d'un
crédit/plafond d'encours — ce dernier point reste hors MVP tant qu'il n'est pas explicitement demandé.

## Ce qui est prêt à utiliser maintenant

- Auth par invitation (société + contact), activation de compte, login, mot de passe oublié.
- Design : police Inter, ombres/hover/transitions soignées, sidebar avec icônes, cartes avec
  élévation au survol, **login en split-screen** (branding bleu nuit + formulaire) — direction
  plus proche d'Apple/Airbnb/Spotify que la V1.
- Catalogue avec **recherche texte + filtres par catégorie** (pills), prix indicatif/origine/
  conditionnement, stepper de quantité, ajout au panier avec feedback immédiat (badge animé).
- **Fiche produit détaillée** (`/catalog/[id]`) : prix, conditionnement, stockage, validité,
  description, caractéristiques techniques, documents téléchargeables (images/documents déjà en
  base via `product_images` / `product_documents`, à alimenter).
- **Adresses de livraison** : gestion complète côté client (page Compte — ajout/suppression/
  adresse par défaut) et sélection de l'adresse au moment de valider la commande.
- **Historique de commande avec timeline de statut** et action "Recommander" directement
  disponible sur chaque ligne de l'historique.
- **Back-office étoffé** (`/admin/orders`) : liste filtrable par statut (onglets), recherche,
  **panneau de détail rapide** (articles, historique de statut, changement de statut) sans
  quitter la liste, et **export CSV** des commandes.
- **Paramétrage des emails & notifications** (`/admin/notifications`) : activer/désactiver
  l'envoi par événement métier (commande créée, statut modifié, invitation, activation, reset
  mot de passe) séparément pour le client et pour l'équipe, plus gestion des destinataires
  équipe (ajout/désactivation/suppression) — remplace la liste `notification_recipients`
  jusque-là non éditable depuis l'UI.
- **Rôles secondaires** : un `org_admin` peut désormais gérer sa propre équipe sur `/team`
  (visible uniquement pour ce rôle) — inviter un collaborateur en choisissant Acheteur
  (`org_buyer`) ou Utilisateur secondaire lecture seule (`org_viewer`), et désactiver/réactiver
  un utilisateur de sa société (sauf lui-même et les autres admins).
- Mobile (Expo) : login, tableau de bord (produits habituels + dernières commandes), catalogue,
  panier avec badge sur l'onglet, validation, historique, duplication de commande.
- Panier web en deux colonnes : détail commande + résumé (sélecteur d'adresse, sous-total
  indicatif si des prix sont renseignés).
- Personnalisation globale : logo + couleurs appliquées à toute l'app, garde-fou de contraste basique.
- Emails transactionnels Resend : invitation, activation, commande créée (client + équipe), changement de statut, reset password — chacun désormais activable/désactivable depuis `/admin/notifications`.
- **Suivi de préparation de commande** : timeline horizontale avec étapes (reçue → confirmée →
  préparation → expédiée → livrée), dates réelles issues de `order_status_history`, sur la fiche
  commande client et la fiche commande back-office.
- **Gestion d'équipe en table** (`/team` côté client, fiche société côté admin) : avatars à
  initiales, colonnes membre/email/rôle/statut, action de désactivation en icône — inspiré d'un
  pattern de gestion d'utilisateurs classique, adapté à la palette Marin Froid.
- **Qualité d'interaction** : skeletons de chargement (coquille sidebar/topbar + contenu, pas de
  flash de page vide), transitions de page douces, toasts système pour les succès/erreurs,
  empty states illustrés (panier vide, aucune commande, aucun résultat catalogue...), gestion
  d'erreur réseau explicite (`safeFetch` distingue erreur réseau vs erreur métier) sur tous les
  formulaires et actions principales.

## Modèle société / utilisateurs / rôles

Le modèle est : une **société** (`organizations`) a plusieurs **utilisateurs** (`users`, rattachés
via `organizationId`), chacun avec un **rôle** qui définit ce qu'il peut faire — pas de compte
partagé unique par entreprise.

| Rôle | Peut commander | Peut gérer les utilisateurs | Reçoit les emails/notifications |
|---|---|---|---|
| `org_admin` (Admin société) | Oui | Oui (page `/team`) | Oui |
| `org_buyer` (Acheteur) | Oui | Non | Oui |
| `org_viewer` (Lecture / administratif — ex. comptabilité) | Non (bloqué à la validation, panier consultable) | Non | Oui |

Concrètement : quand un acheteur valide une commande, l'admin société et les utilisateurs
"lecture/administratif" de la même société reçoivent aussi l'email et la notification in-app
(confirmation, changement de statut) — pas seulement celui qui a passé la commande. Voir
`lib/org-recipients.ts`.

## Trois dashboards, un par rôle

Chaque rôle atterrit sur un dashboard dédié après connexion (`dashboardPathForRole` dans
`lib/auth.ts`), même charte visuelle (sidebar bleu nuit, cartes claires, tableaux, badges
pastel), priorité métier différente :

- **Client** (`org_admin`/`org_buyer`/`org_viewer` → `/dashboard`) : dépenses indicatives (30j),
  commandes (30j), commandes en cours, panier — puis trois colonnes Derniers achats / Réachat
  express / Panier, et le tableau des commandes récentes. Priorité : recommander vite.
- **Préparation** (`mf_ops` → `/admin`, cockpit opérationnel) : KPI À traiter / En préparation /
  Expédiées aujourd'hui / En attente +24h (calculé, pas de date de livraison promise en base
  donc pas de "retard" fabriqué), puis la file de commandes avec panneau de détail rapide.
- **Administration** (`mf_admin` → `/admin/overview`, vue transversale) : sociétés actives,
  utilisateurs actifs, commandes (7j), montant indicatif (30j), activité récente, sociétés à
  suivre (invitées/suspendues), dernières commandes, destinataires notifications actifs,
  branding actif.

Les deux rôles Marin Froid gardent accès à toute la navigation admin (commandes, clients,
invitations, notifications, activité, branding) — seule la page d'atterrissage change.

**Écart assumé avec les maquettes fournies** : "Taux de service", "Taux de délivrabilité email"
et les créneaux/dates de livraison affichés dans les maquettes ne sont pas calculables avec les
données actuellement en base (aucun suivi de date de livraison promise, aucun log succès/échec
par envoi) — plutôt que d'afficher des chiffres inventés, ces KPI ont été remplacés par des
équivalents réels ou omis.

## Centre de notifications client et journal d'activité admin

- **`client_notifications`** (nouvelle table) : chaque commande créée ou changement de statut
  génère une notification in-app pour le client concerné (placeur + admin/comptabilité de sa
  société), avec état lu/non lu. Cloche dans la topbar (`/notifications`), filtres par catégorie,
  "tout marquer comme lu".
- **`activity_logs`** : désormais réellement alimentée (commande créée, statut modifié, invitation
  envoyée, compte activé, société suspendue/réactivée, produit créé/modifié) et consultable sur
  `/admin/activity` avec filtres par type d'événement. Alimente aussi le bloc "Activité récente"
  du dashboard admin.

## Gestion du catalogue admin (`/admin/catalog`)

- Liste avec recherche, filtre actif/désactivé, création de catégorie à la volée.
- Création/édition de produit (référence, nom, catégorie, conditionnement, prix indicatif,
  provenance, stockage, validité, caractéristiques techniques, description, actif/inactif).
- Images et documents gérés **par URL** (pas d'upload de fichier — aucun stockage de type
  Vercel Blob/S3 n'est configuré ; à ajouter si un vrai upload est nécessaire).
- Toute création/modification de produit est tracée dans le journal d'activité.

## Ce qu'il faut encore confirmer

- Nom de domaine expéditeur Resend (DNS/DKIM) et adresse `RESEND_FROM` définitive — voir section dédiée ci-dessous.
- Si un vrai suivi de crédit/encours client doit remplacer l'affichage indicatif actuel.
- Comment alimenter concrètement `product_images` / `product_documents` (upload manuel, import fournisseur, etc.) — l'UI de la fiche produit les affiche déjà si présents.
- Si un rôle "comptabilité" doit être distinct de `org_viewer` avec des permissions différentes (aujourd'hui les deux sont confondus dans `org_viewer`).

## Configurer le domaine d'envoi Resend (DNS/DKIM)

1. Dans le dashboard Resend → **Domains** → **Add Domain**, saisir le domaine expéditeur (ex. `marinfroid.fr` ou un sous-domaine dédié `mail.marinfroid.fr`).
2. Resend fournit des enregistrements DNS (SPF, DKIM, éventuellement DMARC) à ajouter chez le registrar/hébergeur DNS du domaine.
3. Une fois les enregistrements propagés (quelques minutes à quelques heures), Resend valide le domaine automatiquement.
4. Mettre à jour `RESEND_FROM` dans les variables d'environnement Vercel avec une adresse `@` de ce domaine (ex. `Marin Froid <commandes@marinfroid.fr>`).
5. Cette étape nécessite un accès à la zone DNS du domaine — à faire par la personne qui gère l'hébergement/domaine de Marin Froid, je ne peux pas la faire depuis cette session.

## Écrans ajoutés (deuxième planche de maquettes)

- **10-11. Activation / mot de passe oublié / reset** : même shell split-screen que le login
  (`AuthSplitShell`), l'activation prévisualise la société associée à l'invitation avant de
  demander le mot de passe.
- **12. Mon compte** : cartes empilées (identité avec avatar, société, sécurité), la gestion
  des adresses reste juste en dessous (écran 13, déjà couvert précédemment).
- **14. Réachat rapide** (`/reachat`) : agrège l'historique de commandes de la société pour
  afficher les références déjà commandées avec nombre de commandes, dernière date, quantité
  habituelle pré-remplie, tri "Les plus commandés" / "Récents".
- **19. Clients admin** : liste + panneau de détail rapide (même pattern que les commandes),
  bascule active/suspendue directement depuis le panneau, aperçu utilisateurs + dernières commandes.
- **23. Invitations admin** (`/admin/invitations`) : suivi de toutes les invitations envoyées
  (société + équipe), renvoi avec nouveau lien, annulation, détection des invitations expirées.

## Repoussé (chantiers volumineux, hors de cette itération)

- **17. Documents client** : à cadrer d'abord — documents liés aux produits (déjà en base via
  `product_documents`) ou documents généraux société (CGV, fiches commerciales) ? Le périmètre
  exact change l'implémentation.
- **20. Détail société enrichi** (adresses, préférences dans la fiche complète) : la fiche
  actuelle montre déjà utilisateurs + statut ; les blocs adresses par société restent à ajouter.
- **Vue planning** back-office (maquette 08, notion de charge/priorisation opérationnelle) :
  pas implémentée, le back-office reste liste + panneau détail + statuts pour l'instant.
- **Aperçu email avant envoi** et **statut de santé Resend / logs d'envoi visibles dans l'UI**
  (suggestions de la maquette 09) : `email_logs` existe en base mais n'est pas encore affiché.
- **Permissions fines par module** (au-delà du binaire buyer/viewer) : le RBAC reste à 5 rôles
  fixes, pas de système de permissions à la carte.
- **QA + build mobile** (tests des parcours critiques en conditions réelles, configuration EAS
  pour un build App Store/Play Store) : nécessite un compte Apple/Google Developer et des tests
  sur device réels, hors de ce que je peux valider depuis cette session.
- **Monitoring / analytics légers** : pas encore mis en place, à définir selon l'outil souhaité
  (Vercel Analytics, Sentry, Plausible...).
- **Réplique pixel-parfaite des 9 maquettes** : la direction artistique (sidebar bleu nuit,
  cartes claires, split-screen login, timeline statut, panneau détail back-office) a été
  appliquée, mais certains détails visuels (photos produits réelles, galerie fiche produit,
  micro-interactions précises) restent à affiner avec de vrais assets.
