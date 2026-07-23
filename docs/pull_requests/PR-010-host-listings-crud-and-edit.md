# PR #010 — CRUD Complet des Annonces Hôte & Édition Directe Fiche Logement

## Ticket ClickUp
[CU-010] CRUD complet des Annonces Hote & Edition sur Fiche Logement

## Contexte
Afin de donner un contrôle total aux Hôtes sur leur catalogue d'annonces, ce développement apporte un CRUD complet (Create, Read, Update, Delete) accessible depuis le Dashboard Hôte ainsi qu'une bascule dynamique sur la fiche logement (`/listings/[id]`) lorsque l'utilisateur connecté est le propriétaire du bien.

## Description des changements

### Service Backend & Métiers (src/lib/server/listings.ts)
- `updateListing(id, hostId, input)` :
  - Vérification du droit de propriété (`hostId === listing.hostId`)
  - Mise à jour sélective des champs (Titre, Description, Adresse, Tarifs, Caution, Capacité, Photo, Événements autorisés)
- `deleteListing(id, hostId)` :
  - Vérification de l'absence de réservations actives (`CONFIRMED` ou `PENDING_PAYMENT`)
  - Suppression sécurisée de l'annonce en BDD

### Endpoints API (src/routes/api/listings/[id]/+server.ts)
- `PUT /api/listings/[id]` : Modification des détails d'une annonce
- `DELETE /api/listings/[id]` : Suppression d'une annonce avec gestion des erreurs métier (réservations en cours)

### Fiche Logement & Édition (src/routes/listings/[id]/)
- `/listings/[id]/+page.svelte` : Détection du propriétaire (`isOwner`). Remplace le tunnel de réservation par un bouton violet **« Éditer mon annonce »** ainsi qu'un carrousel d'images interactif avec navigation et vignette.
- `/listings/[id]/edit/` & `/listings/new/` : Zone de glisser-déposer / upload d'images (PNG, JPG, WEBP) remplaçant la saisie d'URLs Unsplash.
- `POST /api/upload` : Enregistrement local des fichiers téléversés dans `static/uploads/listings/` et retour des URLs serveur `/uploads/listings/filename`.

### Dashboard Hôte (src/routes/dashboard/+page.svelte)
- Ajout des actions **« Voir »**, **« Éditer »** et **« Supprimer »** sur chaque carte d'annonce de la section **Mes Annonces**
- Confirmation utilisateur avant suppression et rafraîchissement réactif

### Tests Unitaires (src/lib/server/listings.test.ts)
- 7 tests Vitest couvrant :
  - Recherche et filtrage multi-critères
  - Récupération par ID
  - Modification d'annonce et contrôle d'autorisation
  - Suppression sécurisée et blocage si réservations en cours

## Checklist de revue
- [x] Contrôle d'autorisation propriétaire sur modification/suppression
- [x] Sécurité : Blocage de la suppression si réservations actives
- [x] svelte-check (0 erreur)
- [x] Suite Vitest 28/28 verte (7 files passed)
- [x] Redirection fluide et retour visuel après édition/suppression

## Revue de code simulée (Marc Dupont — QA Lead)

### Remarque
Excellente intégration du rôle Hôte. Le blocage de suppression en cas de réservation active protège le workflow financier du séquestre.

### Réponse
Merci Marc ! Tout est vérifié et couvert par la suite de tests unitaires Vitest.
