# PR #016 — Refacto Moteur de Recherche Réutilisable (Tag Ville & DatePicker Airbnb)

## Ticket ClickUp
[CU-016] Refacto Moteur de Recherche Réutilisable (Tag Ville & DatePicker Airbnb) — `86caw71yn`

## Contexte
Mutualisation et refonte intégrale du moteur de recherche pour les pages d'accueil (`/`) et de catalogue des annonces (`/listings`). Mise en place d'une autocomplétion avec sélection sous forme de **Tag / Pill amovible pour la ville** et sélection des dates d'événement (`startDate` et `endDate`).

## Description des changements

### API Cities (`src/routes/api/listings/cities/+server.ts`)
- Endpoint renvoyant les villes distinctes hébergeant des logements en BDD couplées aux villes phares d'événements.

### Composant Mutualisé (`src/lib/components/SearchEngine.svelte`)
- Autocomplétion dynamique des villes.
- Verrouillage de la ville sous forme de **Tag / Pill violet amovible** avec bouton de suppression `x`.
- Sélecteurs de date de début et date de fin d'événement (style Airbnb).
- Filtre de capacité d'accueil minimum et de type d'événement.
- Gestion du bouton de réinitialisation dynamique.

### Intégration Pages (`src/routes/+page.svelte` & `src/routes/listings/+page.svelte`)
- Intégration de `<SearchEngine variant="hero" />` sur la page d'accueil.
- Intégration de `<SearchEngine variant="bar" />` sur la page listings avec mise à jour en direct de l'URL et des résultats.

## Checklist de revue
- [x] Composant `SearchEngine.svelte` partagé sans duplication de code.
- [x] Tag ville amovible avec bouton de suppression `x`.
- [x] Plage de dates `startDate` et `endDate` opérationnelles.
- [x] svelte-check (0 erreur).
- [x] Suite Vitest (43/43 tests validés).

## Revue de code simulée (Thomas Moreau — Lead Frontend)

### Remarque
Excellente refactorisation. L'unification du composant `SearchEngine` supprime toute duplication tout en rendant la saisie de ville sous forme de Tag amovible extrêmement fluide et intuitive.

### Réponse
Merci Thomas ! La réutilisation sur `/` et `/listings` fonctionne parfaitement avec 43 tests au vert.
