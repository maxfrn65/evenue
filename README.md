# 🏡 Evenue — Location de Lieux d'Événements Privés avec Assurance Wakam & Séquestre Stripe

> **Evenue** est la première plateforme web de réservation de logements et lieux d'exception dédiés aux événements privés (soirées, anniversaires, réceptions, cocktails). Chaque réservation inclut nativement une **police d'assurance bris & dégradations Wakam** (couverture 10 000 €, 0 € de franchise hôte) protégée par un pattern **Circuit Breaker** et un gel des fonds via **séquestre Stripe Connect**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & App Framework** : SvelteKit (Svelte 5 Runes), TypeScript, TailwindCSS v4, Lucide Icons, Shadcn-Svelte.
- **Backend & ORM** : Node.js 22, Prisma ORM v7 (Driver Adapter `pg`), PostgreSQL (Docker Compose / Neon Cloud).
- **InsurTech & Fintech** : API Assurance Wakam, Séquestre bancaire Stripe Connect Express, Vérification d'identité KYC.
- **Résilience & Monitoring** : Pattern Circuit Breaker (3 états), Logging structuré JSON, Métriques Prométhéennes (`/api/metrics`).
- **Tests & Qualité** : Vitest (`@vitest/coverage-v8`), `svelte-check` (Typage 100% strict).
- **Déploiement Cloud** : Docker Multi-Stage, GitHub Actions CI/CD, Scaleway Serverless Containers (0 €/mois).

---

## 📋 Prérequis Système

Assurez-vous d'avoir installé les outils suivants sur votre machine :

- **Node.js** : `>= 22.0.0` (Recommandé) ou `>= 20.0.0`
- **npm** : `>= 10.0.0`
- **Docker & Docker Compose** (pour faire tourner la base de données PostgreSQL locale)
- **Git**

---

## 🚀 Guide d'Installation & Lancement en Local Pas-à-Pas

### 1. Cloner le projet & Installer les dépendances

```bash
git clone https://github.com/maxfrn65/evenue.git
cd evenue
npm install
```

### 2. Démarrer la stack PostgreSQL locale via Docker Compose

Lancez le conteneur PostgreSQL configuré pour le projet (port `5433`) :

```bash
docker compose up -d
```

> **Note** : Le fichier `.env` par défaut est déjà préconfiguré pour se connecter à cette instance Docker :
>
> ```env
> DATABASE_URL="postgresql://evenue_user:evenue_password@localhost:5433/evenue_db?schema=public"
> ```

---

### 3. Initialiser la Base de Données & Injecter les Données de Démo (Seeding)

Générez le client Prisma, créez les tables PostgreSQL et alimentez la base de données avec des logements et des utilisateurs de test :

```bash
# Générer le client Prisma v7
npx prisma generate

# Créer les tables dans la base PostgreSQL Docker
npx prisma db push

# Injecter les annonces et comptes utilisateurs de démo
npx prisma db seed
```

---

### 4. Démarrer le serveur de développement local

Lancez l'application SvelteKit :

```bash
npm run dev
```

Ouvrez votre navigateur sur **[http://localhost:5173](http://localhost:5173)** ! 🚀

---

## 👤 Comptes de Démo (Seed Data)

Pour tester immédiatement l'ensemble des fonctionnalités de la plateforme (réservation, dashboard hôte, déclaration de sinistre, messagerie) :

| Rôle                   | Adresse Email                 | Mot de Passe  | Fonctionnalités accessibles                                                                                |
| ---------------------- | ----------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| **Hôte Propriétaire**  | `jean.dupont@evenue.fr`       | `password123` | Création/Édition d'annonces, réservations reçues, déclaration de sinistres Wakam 7j, synchronisation iCal. |
| **Hôte Propriétaire**  | `sophie.martin@evenue.fr`     | `password123` | Gestion de lofts & villas, acceptation de réservations.                                                    |
| **Invité / Locataire** | `alexandre.riviere@evenue.fr` | `password123` | Recherche géolocalisée, réservation avec séquestre Stripe, contestation de sinistre 7j, messagerie.        |

---

## 🧪 Commandes Utiles & Suite de Tests

```bash
# 1. Lancer la vérification du typage Svelte 5 / TypeScript
npm run check

# 2. Exécuter l'ensemble de la suite de tests unitaires (63 tests)
npm run test:unit -- --run

# 3. Générer le rapport de couverture de code (Coverage v8 > 80%)
npm run test:coverage

# 4. Compiler le bundle de production Node.js
npm run build

# 5. Stopper la stack Docker PostgreSQL locale
docker compose down
```

---

## 📂 Structure du Dépôt

```
evenue/
├── .github/workflows/       # Workflow CI/CD GitHub Actions (Check, Coverage, Build & Scaleway Deploy)
├── docker-compose.yml       # Stack Docker PostgreSQL local (Port 5433)
├── prisma/                  # Schéma BDD, migrations et script de seeding (seed.ts)
├── src/
│   ├── lib/
│   │   ├── components/      # Composants UI réutilisables (SearchEngine, Header, Footer, Map)
│   │   └── server/          # Services métier serveur (auth, claims, bookings, ical, wakam, stripe, logger)
│   ├── routes/              # Routes SvelteKit (App Pages, Dashboard, API endpoints)
│   └── hooks.server.ts      # Middleware telemetry, request logging & error handling
├── docs/                    # Plan d'architecture, burndown J/H et guides (DEPLOYMENT_SCALEWAY, GRAFANA)
├── Dockerfile               # Multi-stage Dockerfile pour Scaleway Serverless Containers
└── vite.config.ts           # Configuration Vite & Vitest
```
