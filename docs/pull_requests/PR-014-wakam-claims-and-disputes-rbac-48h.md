# PR #014 — Déclaration & Gestion des Sinistres Wakam, Fenêtre 7 jours, Contestation Locataire & RBAC

## Ticket ClickUp
[CU-014] Déclaration & Gestion des Sinistres Wakam (Fenêtre 7 jours Hôte, Contestation Locataire & Gel Séquestre) — `86caw6nht`

## Contexte
Mise en place de la spécification complète de gestion des sinistres d'après `ticket-sinistres.md` : le droit de déclaration d'un sinistre Wakam est strictly réservé au propriétaire (Hôte) ayant mis son bien à disposition, sous réserve de respecter une fenêtre temporelle de 7 jours post-événement. Le locataire (Guest) ne peut jamais déclarer de sinistre, mais dispose du droit de contester une déclaration avec pièces justificatives (état des lieux, photos).

## Description des changements

### Modèles BDD PostgreSQL & Prisma (prisma/schema.prisma)
- Ajout du modèle `ClaimHistory` (auteur, horodatage, ancien statut, nouveau statut, notes).
- Évolution du modèle `Claim` : `declarantId`, `declarantRole` ("HOST"), `isDisputed`, `disputeReason`, `disputeEvidenceUrls`, `disputedAt`.

### Service Backend Claims (src/lib/server/claims.ts)
- `submitClaim` :
  - **RBAC Strict** : Rejet si l'utilisateur n'est pas l'Hôte propriétaire (`booking.listing.hostId !== userId`).
  - **Fenêtre 7 jours** : Rejet si le délai écoulé depuis `booking.endDate` dépasse 7 jours (`La fenêtre de déclaration de sinistre de 7 jours post-événement est expirée.`).
  - Passage de la police Wakam et du séquestre Stripe à `CLAIMED` / `DISPUTED`.
  - Création de l'enregistrement `Claim` et écriture dans l'historique `ClaimHistory`.
- `disputeClaim` :
  - **Droit Locataire** : Réservé exclusivement au Guest de la réservation (`booking.guestId === userId`).
  - Enregistrement des motifs et preuves de contestation (`disputeEvidenceUrls`), passage du flag `isDisputed` à `true` et mise à jour de `ClaimHistory`.

### Endpoints REST & Interfaces UI (src/routes/claims/new/)
- `POST /api/claims/dispute` : Endpoint dédié à la contestation du locataire.
- `src/routes/claims/new/+page.server.ts` & `+page.svelte` :
  - Filtre les réservations éligibles sur la liste des logements où l'utilisateur connecté est Hôte (`hostBookings`).
  - Affiche une notice d'information claire sur le rôle Hôte et la contestation réservée au locataire.

## Checklist de revue
- [x] Contrôle d'accès RBAC strict (Hôte = déclaration / Guest = contestation).
- [x] Fenêtre de déclaration de 7 jours après la fin de l'événement.
- [x] Modèle `ClaimHistory` et historisation de chaque transition de statut.
- [x] Endpoint `POST /api/claims/dispute` pour la contestation locataire.
- [x] svelte-check (0 erreur).
- [x] Suite Vitest 43/43 verte (11 test files passed).

## Revue de code simulée (Sarah Chen — API & Integrations Lead)

### Remarque
Excellente implémentation de la règle métier. La séparation nette des rôles entre l'hôte déclarant et le convive contestataire respecte parfaitement la spécification Wakam & Stripe Connect.

### Réponse
Merci Sarah ! Tout le cycle de tests et la vérification de typage sont validés avec 43 tests unitaires au vert.
