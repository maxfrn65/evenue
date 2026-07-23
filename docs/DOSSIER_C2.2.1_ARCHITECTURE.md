# Dossier Architecture Logicielle & Prototype

**Compétence visée (éliminatoire)** : **C2.2.1** — *Concevoir un prototype de l'application logicielle en tenant compte des spécificités ergonomiques et des équipements ciblés (web, mobile…) afin de répondre aux fonctionnalités attendues et aux exigences en termes de sécurité.*

**Critères d'évaluation associés** : architecture structurée permettant la maintenabilité ; bonnes pratiques (frameworks, paradigmes) ; prototype fonctionnel couvrant les fonctionnalités principales et les user stories ; composants d'interface présents et fonctionnels ; exigences de sécurité satisfaites.

---

## 1. Présentation du prototype

**Evenue** est une place de marché (marketplace) de **location de lieux pour événements** (soirées, mariages, anniversaires) avec **paiement sous séquestre** et **assurance embarquée**. L'application est un **prototype fonctionnel et manipulable en autonomie** couvrant le parcours complet : recherche géolocalisée → réservation → séquestre financier → assurance → gestion de sinistre.

**Équipements ciblés** : application **web responsive** (rendu serveur), consultable sur desktop, tablette et mobile. Design system mobile-first avec grilles fluides Tailwind.

---

## 2. Pile technologique (frameworks & paradigmes)

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| Framework applicatif | **SvelteKit** | ^2.63 | SSR, routing, endpoints, form actions |
| Langage UI | **Svelte 5 (runes)** | ^5.56 | Réactivité (`$props`, `$state`, `$derived`, `$effect`) |
| Langage | **TypeScript** | ^6.0 | Typage statique de bout en bout |
| ORM | **Prisma** | ^7.9 | Accès données typé, migrations, adapter `PrismaPg` |
| Base de données | **PostgreSQL** | — | Transactions ACID (indispensables au séquestre) |
| Paiement | **Stripe (Connect)** | ^22.3 | Séquestre, onboarding KYC, versements |
| Design system | **shadcn-svelte + bits-ui** | — | Primitives accessibles (Button, Input, Dialog…) |
| Style | **Tailwind CSS** | ^4.3 | Utilitaires, tokens de thème (oklch) |
| Cartographie | **Leaflet** | ^1.9 | Carte interactive, tuiles CartoDB/OSM |
| Build / test | **Vite / Vitest** | ^8 / ^4 | Bundling, tests unitaires + couverture v8 |
| Déploiement | **adapter-node + Docker** | — | Conteneur serverless Scaleway |

**Paradigmes de développement mis en œuvre** :
- **Rendu côté serveur (SSR)** avec fonctions `load` (`+page.server.ts`) et middleware d'authentification centralisé (`hooks.server.ts`).
- **Composition de composants** via le pattern shadcn-svelte / bits-ui.
- **Pattern Circuit Breaker** (3 états) pour la résilience des dépendances tierces.
- **Driver Adapter Prisma v7** (`PrismaPg` sur un pool `pg`) — architecture mandatée par Prisma 7.
- **Programmation réactive** via les runes Svelte 5.
- **Séparation en couches** (voir §3).

---

## 3. Architecture en couches (maintenabilité)

```
src/
├── app.html                     # squelette HTML (lang="fr", meta viewport)
├── hooks.server.ts              # middleware transverse : auth + headers sécurité + logs
├── routes/                      # COUCHE PRÉSENTATION + ENDPOINTS
│   ├── +layout.svelte           #   gabarit global (skip-link, header, main, footer)
│   ├── **/+page.svelte          #   pages (SSR)
│   ├── **/+page.server.ts       #   chargement données / guards
│   └── api/**/+server.ts        #   endpoints REST (JSON)
├── lib/
│   ├── components/              # COUCHE UI (SearchEngine, Header, Footer, Map…)
│   │   └── ui/                  #   primitives design system (shadcn-svelte)
│   └── server/                  # COUCHE LOGIQUE MÉTIER & ACCÈS DONNÉES (server-only)
│       ├── db.ts                #   client Prisma (adapter PrismaPg)
│       ├── auth.ts              #   hachage scrypt, inscription, connexion
│       ├── session.ts           #   options durcies du cookie de session
│       ├── rate-limit.ts        #   limiteur de débit (anti-brute-force)
│       ├── url-safety.ts        #   validation anti-SSRF des URLs iCal
│       ├── stripe.ts            #   séquestre & KYC Stripe Connect
│       ├── wakam.ts             #   assurance via Circuit Breaker
│       ├── circuit-breaker.ts   #   moteur de résilience 3 états
│       ├── bookings.ts          #   moteur de réservation & séquestre
│       ├── listings.ts          #   CRUD & recherche filtrée
│       ├── ical.ts              #   génération/import iCal (anti double-booking)
│       ├── claims.ts            #   sinistres, contestation, attestations
│       ├── messages.ts          #   messagerie
│       └── logger.ts            #   journalisation JSON structurée
└── generated/prisma/            # client Prisma généré
```

**Principe de séparation des responsabilités** :
- **Présentation** (`routes/*.svelte`, `lib/components`) : rendu et interactions.
- **Logique métier & accès données** (`lib/server/*.ts`) : **seule couche autorisée à interroger Prisma**.
- **Intégrations externes** isolées derrière des modules dédiés (`stripe.ts`, `wakam.ts`).
- **Préoccupations transverses** (authentification, en-têtes de sécurité, journalisation) centralisées dans `hooks.server.ts`.

Ce découpage garantit la **maintenabilité** (responsabilités isolées, testabilité unitaire de la couche métier) et la **testabilité** (la couche `lib/server` est couverte à ~79 % par la suite Vitest).

---

## 4. Modèle de données

Entités principales et relations (`prisma/schema.prisma`) :

- **User** (1—N) **Listing** ; (1—N) **Booking** ; (1—N) **Message**.
- **Listing** (1—N) **Booking** ; porte géolocalisation (lat/long), `imageUrls[]`, `eventTypeAllowed[]`, `icalSyncUrl`, plages de disponibilité.
- **Booking** (1—1) **InsurancePolicy** ; (1—1) **Payout** ; (1—N) **Claim** ; ventile `totalPrice` en `hostEarnings` / `platformFee` / `insuranceFee` / `securityDepositAmount` ; conserve les identifiants Stripe.
- **Claim** (1—N) **ClaimHistory** (piste d'audit).

**Énumérations** : `UserRole` {HOST, GUEST, ADMIN} · `KycStatus` {NOT_STARTED, PENDING, VERIFIED, REJECTED} · `BookingStatus` {PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED, DISPUTED} · `InsuranceStatus` {PENDING, ACTIVE, CLAIMED, EXPIRED, FAILED} · `PayoutStatus` {HELD_IN_ESCROW, DISBURSED, REFUNDED}.

---

## 5. Fonctionnalités principales & user stories couvertes

| User story | Implémentation |
|---|---|
| Rechercher un lieu par ville, prix, capacité, type d'événement, dates | `listings.ts::getListings`, `SearchEngine.svelte`, carte `InteractiveMap.svelte` |
| Consulter une fiche et ses disponibilités (bookings + iCal externe) | `routes/listings/[id]`, `ical.ts` |
| S'inscrire / se connecter (invité ou hôte) | `auth.ts`, `routes/auth/**`, `api/auth/**` |
| Devenir hôte + onboarding KYC Stripe | `routes/become-host`, `stripe.ts` |
| Créer / éditer / supprimer une annonce (avec upload d'images) | `listings.ts`, `routes/listings/new`, `[id]/edit`, `api/upload` |
| Réserver avec séquestre + assurance automatique | `bookings.ts`, `stripe.ts`, `wakam.ts` |
| Déclarer / contester un sinistre, télécharger une attestation | `claims.ts`, `routes/claims/new`, `bookings/[id]/certificate` |
| Échanger via messagerie | `messages.ts`, `routes/messages` |
| Tableau de bord invité/hôte | `dashboard.ts`, `routes/dashboard` |
| Synchronisation calendrier iCal bidirectionnelle | `ical.ts`, `routes/listings/[id]/ical` |

---

## 6. Exigences de sécurité satisfaites

Le prototype intègre la sécurité **dès la conception** : authentification centralisée, contrôle d'accès propriétaire-ressource, hachage scrypt, séquestre à capture différée, validation anti-SSRF, rate limiting, en-têtes de sécurité + CSP. Le détail de la couverture **OWASP Top 10** est fourni dans `docs/DOSSIER_C2.2.3_SECURITE_OWASP.md`.

---

## 7. Composants d'interface

Le design system (dossier `src/lib/components/ui/`) fournit les briques fonctionnelles : boutons, champs, groupes de champs, cartes, badges, sélecteurs, menus déroulants, popovers, infobulles, calendrier/date-picker. Les composants métier (`SearchEngine`, `Header`, `Footer`, `ListingForm`, `InteractiveMap`, `CoverageBanner`) assemblent ces primitives. Tous les éléments interactifs sont **fonctionnels et accessibles au clavier** (cf. dossier accessibilité).
