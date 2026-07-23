# PR #012 — Messagerie Instantanée & Notifications Temps Réel

## Ticket ClickUp
[CU-012] Messagerie Instantanée & Notifications Temps Réel

## Contexte
Afin de faciliter les échanges directs entre Hôtes et Invités pour l'organisation d'événements (demande de détails sur la sonorisation, ajustements d'horaires, règles du logement), cette PR introduit le module de messagerie instantanée en temps réel.

## Description des changements

### BDD & Schema Prisma (prisma/schema.prisma)
- Ajout du modèle `Message` avec relations vers `User` (expéditeur & destinataire) et `Booking` (optionnel)
- Exécution de `npx prisma db push` et `npx prisma generate`

### Service Backend Messagerie (src/lib/server/messages.ts)
- `sendMessage({ senderId, receiverId, content, bookingId? })` : Validation et création des messages
- `getConversations(userId)` : Récupération des conversations groupées par interlocuteur avec compteur de messages non-lus
- `getConversationMessages(userId, otherUserId)` : Récupération des fil de discussion ordonnés avec marquage automatique comme lu

### Endpoints API & Routes (src/routes/)
- `POST /api/messages` & `GET /api/messages` : Endpoints REST de la messagerie
- Interface `/messages` (`+page.svelte` & `+page.server.ts`) : Vue réactive à 2 colonnes avec tchat en direct et rafraîchissement dynamique (3s)
- Fiche logement (`src/routes/listings/[id]/+page.svelte`) : Bouton **« Contacter l'Hôte »** pour l'accès direct aux échanges
- Header : badge de messages non lus, actualisé toutes les 15 secondes

### Tests Unitaires (src/lib/server/messages.test.ts)
- 4 tests Vitest validant l'envoi, la récupération des conversations et le comptage des messages non lus

## Checklist de revue
- [x] Modèle PostgreSQL Prisma `Message` créé et synchronisé
- [x] Interface réactive Svelte 5 avec rafraîchissement en direct (3s)
- [x] svelte-check (0 erreur)
- [x] Suite Vitest 41/41 verte (11 fichiers de tests)
- [x] Build de production validé

## Revue de code simulée (Julie Dupuis — UX/UI Designer)

### Remarque
L'expérience utilisateur à 2 colonnes est fluide et claire. Les boutons « Contacter l'Hôte » permettent d'initier un échange en un clic depuis n'importe quel logement.

### Réponse
Merci Julie ! Le module est parfaitement intégré au header et aux fiches d'annonces.
