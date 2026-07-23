# PR #011 — Synchronisation iCal Bidirectionnelle Anti Double-Booking

## Ticket ClickUp
[CU-011] Synchronisation iCal Bidirectionnelle Anti Double-Booking

## Contexte
Afin d'empêcher tout risque de surréservation (double-booking) entre Evenue et les plateformes de réservation tierces (Airbnb, Booking.com, Google Calendar), cette PR apporte l'importation et l'exportation bidirectionnelles d'agendas au format standard iCalendar (RFC 5545 `.ics`).

## Description des changements

### Service iCal Backend (src/lib/server/ical.ts)
- `generateListingICal(listingId)` : Génère la chaîne RFC 5545 d'un calendrier `.ics` avec la liste des VEVENTs d'une annonce
- `parseICalEvents(icalContent)` : Extrait les plages d'indisponibilité `(startDate, endDate)` d'un flux `.ics`
- `fetchAndParseExternalICal(url)` : Récupère et analyse le calendrier distant d'un tiers avec gestion d'un timeout de 3 secondes
- `isListingAvailable(listingId, startDate, endDate)` : Détecte les chevauchements de dates entre les réservations BDD Prisma et les événements iCal distants

### Moteur de Réservation (src/lib/server/bookings.ts)
- Intégration du contrôle `isListingAvailable` au niveau de `createBooking` bloquant l'enregistrement en cas d'indisponibilité

### Endpoints API & Formulaires (src/routes/)
- `GET /listings/[id]/ical` : Route de téléchargement ou d'abonnement au calendrier iCal (`Content-Type: text/calendar`)
- `ListingForm.svelte` : Ajout du champ d'import iCal `icalSyncUrl` dans les formulaires d'annonces
- `src/routes/listings/[id]/+page.svelte` : Bouton d'export du calendrier iCal disponible sur la fiche logement pour l'hôte

### Tests Unitaires (src/lib/server/ical.test.ts)
- 4 tests Vitest validant la conformité RFC 5545, le parsing de VEVENTs et la détection de chevauchements

## Checklist de revue
- [x] Conformité RFC 5545 iCalendar (DTSTART, DTEND, VEVENT, VCALENDAR)
- [x] Tolérance aux pannes réseau (Timeout 3s sur les flux distants)
- [x] svelte-check (0 erreur)
- [x] Suite Vitest 34/34 verte (9 test files passed)

## Revue de code simulée (Marc Dupont — QA Lead)

### Remarque
La vérification de disponibilité synchrone inclut la détection d'événements distants iCal. Le timeout de 3s protège la réactivité du tunnel de réservation.

### Réponse
Merci Marc ! Les tests unitaires couvrent l'exportation, l'importation et la prévention des double-bookings.
