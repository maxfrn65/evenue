# PR #008 — Dashboard Utilisateur : Mes Réservations & Mes Annonces

## Ticket ClickUp
[CU-008] Dashboard Utilisateur: Mes Reservations et Mes Annonces (Hote)

## Contexte
L'utilisateur connecté n'avait aucun espace personnel pour consulter ses réservations passées et à venir, ni pour gérer ses annonces en tant qu'hôte. Le Header contenait un lien « Mes Réservations » qui pointait vers /bookings (page inexistante).

## Description des changements

### Service Backend (src/lib/server/dashboard.ts)
- Nouveau service `getDashboardData(userId, userRole)` qui agrège :
  - Les réservations de l'utilisateur (en tant qu'invité) avec listing et police d'assurance Wakam
  - Les annonces publiées (en tant qu'hôte) avec compteur de réservations et revenus cumulés
  - Des statistiques synthétiques (total réservations, à venir, dépensé, revenus hôte)
- Fonction `cancelBooking(bookingId, userId)` pour l'annulation sécurisée (vérification de propriété)

### Route Dashboard (src/routes/dashboard/)
- `+page.server.ts` : Chargement serveur avec redirection vers /auth/login si non authentifié
- `+page.svelte` : Interface complète avec :
  - 4 cartes de statistiques synthétiques (Réservations, À venir, Total dépensé, Revenus hôte / Assurance Wakam)
  - Liste détaillée des réservations avec statut coloré (Badge), dates, lieu, montant, police Wakam
  - Actions : Voir la fiche du logement, Annuler la réservation
  - Section « Mes Annonces » (visible uniquement pour le rôle HOST) avec métriques par logement

### API Annulation (src/routes/api/bookings/cancel/)
- Endpoint POST /api/bookings/cancel avec vérification d'authentification et de propriété

### Navigation (Header)
- Ajout du lien « Mon Espace » dans le menu utilisateur connecté, pointant vers /dashboard

### Tests Unitaires (src/lib/server/dashboard.test.ts)
- 4 tests Vitest couvrant :
  - Données dashboard pour un utilisateur GUEST (réservations sans annonces)
  - Données dashboard pour un utilisateur HOST (réservations + annonces avec revenus)
  - Annulation réussie d'une réservation confirmée
  - Refus d'annulation si la réservation n'existe pas ou n'appartient pas à l'utilisateur

## Checklist de revue
- [x] Redirection vers /auth/login si utilisateur non connecté
- [x] Données chargées côté serveur (SSR)
- [x] Composants shadcn-svelte (Card, Badge, Button, Separator) utilisés sans modification
- [x] Typage TypeScript strict (pas d'implicit any)
- [x] Tests unitaires 4/4 verts
- [x] Sécurité : vérification de propriété avant annulation

## Revue de code simulée (Marc Dupont — QA Lead)

### Point d'amélioration
La pagination des réservations n'est pas implémentée. Pour un utilisateur ayant un historique important (50+ réservations), le chargement de toutes les réservations en une seule requête Prisma pourrait impacter les performances. Il serait pertinent d'ajouter un système de pagination (cursor-based ou offset) avec un paramètre `take` dans la requête Prisma.

### Réponse
Point noté et pertinent. Pour le MVP, le volume de réservations par utilisateur reste faible (estimation < 20 par utilisateur actif). La pagination sera implémentée dans un ticket dédié (CU-XXX) lors de la phase d'optimisation (Lot 8 - Tests & Qualité), en même temps que l'ajout de filtres par statut et par période sur le dashboard.
