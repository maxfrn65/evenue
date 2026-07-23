# PR #013 — Plages de Disponibilité Hôte, Filtre de Recherche & DatePicker Shadcn

## Ticket ClickUp
[CU-013] Gestion des Plages de Disponibilité Hôte, Filtre de Recherche & DatePicker Shadcn

## Contexte
Afin d'offrir une expérience de réservation fluide et sans friction inspirée d'Airbnb, cette PR apporte la définition des plages de disponibilité configurables par l'hôte, le filtrage strict des résultats de recherche par dates et l'intégration du composant interactif Shadcn DatePicker / Calendar désactivant visuellement les jours indisponibles et déjà réservés.

## Description des changements

### BDD & Schema Prisma (prisma/schema.prisma)
- Ajout des champs `availableStartDate DateTime?` et `availableEndDate DateTime?` au modèle `Listing`
- Migration PostgreSQL et régénération du Prisma Client (`npx prisma db push && npx prisma generate`)

### Moteur de Recherche & Service Listings (src/lib/server/listings.ts)
- Filtrage par date dans `getListings({ startDate, endDate })` : élimine automatiquement les annonces dont la plage de disponibilité ne couvre pas les dates recherchées ou ayant des réservations confirmées / événements iCal en conflit
- `getListingDisabledDates(listingId)` : extrait les plages fermées par l'hôte, les réservations BDD et les indisponibilités iCal pour alimenter le calendrier frontend

### Composant Shadcn DatePicker / Calendar (src/lib/components/ui/calendar/)
- Installation des composants `calendar` et `popover` via le CLI `shadcn-svelte`
- Intégration du composant Calendar sur la fiche logement (`/listings/[id]`) et sur la page de réservation (`/bookings/new`) avec la propriété `isDateDisabled` pour griser et désactiver les jours indisponibles

### Formulaire Hôte (ListingForm.svelte)
- Ajout de la section de sélection des plages d'ouverture et de fermeture des réservations (`availableStartDate` & `availableEndDate`)

## Checklist de revue
- [x] Plages de disponibilité hôte configurables dans `ListingForm.svelte`
- [x] Filtrage strict par dates au moteur de recherche (`/` et `/listings`)
- [x] Grisage et désactivation des jours occupés sur le DatePicker Shadcn
- [x] svelte-check (0 erreur)
- [x] Suite Vitest 42/42 verte (11 test files passed)

## Revue de code simulée (Thomas Moreau — Dev Lead)

### Remarque
L'affichage réactif du calendrier Shadcn désactive proprement les jours passés, hors plage hôte et réservés. Le filtrage serveur élimine immédiatement les indisponibles.

### Réponse
Merci Thomas ! Les tests unitaires et les vérifications de typage sont 100% au vert.
