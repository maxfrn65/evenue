# Guide d'Architecture & Déploiement Cloud Scaleway Serverless

Ce document détaille la procédure de déploiement et la conteneurisation de la plateforme Evenue sur l'infrastructure **Scaleway Serverless Containers** avec une base de données PostgreSQL serverless gratuite.

---

## 🏗️ Architecture Cloud

```
                         +-----------------------------------+
                         |         GitHub Repository         |
                         |   (Push sur la branche main)      |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------+-----------------+
                         |     GitHub Actions CI/CD          |
                         | - svelte-check                    |
                         | - Vitest Coverage (>80%)          |
                         | - Docker Build Multi-stage        |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------+-----------------+
                         |   Scaleway Container Registry     |
                         | (rg.fr-par.scw.cloud/evenue/app)  |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------+-----------------+
                         |   Scaleway Serverless Container   |
                         | (Auto-scaling 0 à N instances)   |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------+-----------------+
                         |     PostgreSQL Cloud (Neon.tech)  |
                         | (Base de données gratuite SSL)    |
                         +-----------------------------------+
```

---

## 🔑 Variables d'Environnement (GitHub Secrets)

Pour alimenter la CI/CD GitHub Actions, configurez les secrets suivants dans **Settings > Secrets and variables > Actions** sur GitHub :

| Secret                   | Description                             | Exemple                                                         |
| ------------------------ | --------------------------------------- | --------------------------------------------------------------- |
| `SCW_SECRET_KEY`         | Clé d'API secrète Scaleway              | `11111111-2222-3333-4444-555555555555`                          |
| `SCW_DEFAULT_PROJECT_ID` | Project ID de l'organisation Scaleway   | `a1b2c3d4-e5f6-7890-abcd-1234567890ab`                          |
| `DATABASE_URL`           | Chaîne de connexion PostgreSQL avec SSL | `postgres://user:pass@ep-cool.neon.tech/neondb?sslmode=require` |
| `STRIPE_SECRET_KEY`      | Clé d'API Stripe Connect                | `sk_test_51...`                                                 |

---

## 🗄️ Mise à jour du schéma de base

Le projet ne versionne pas de migrations : le schéma est appliqué avec `prisma db push`, et
la CI ne touche jamais à la base. Toute évolution de `prisma/schema.prisma` doit donc être
poussée manuellement vers Neon **avant** le déploiement de l'image qui en dépend.

> ⚠️ `prisma.config.ts` charge `dotenv`, donc sans variable d'environnement explicite les
> commandes Prisma visent le `.env` local — c'est-à-dire la base Docker de développement.
> `dotenv` n'écrase jamais une variable déjà définie : passer `DATABASE_URL` devant la
> commande suffit à cibler Neon.

**1. Charger la chaîne de connexion sans l'inscrire dans l'historique du shell**

```bash
read -rs "?Chaîne de connexion Neon : " NEON_URL && export DATABASE_URL="$NEON_URL"
```

**2. Prévisualiser le SQL qui serait appliqué** (ne modifie rien)

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

Une sortie `-- This is an empty migration.` signifie que Neon est déjà à jour.

**3. Appliquer** — au choix :

- coller le SQL relu à l'étape 2 dans le **SQL Editor** de la console Neon (recommandé :
  aucune option destructive, et la trace reste dans l'historique Neon) ;
- ou laisser Prisma le faire : `npx prisma db push`. Il demande `--accept-data-loss` dès
  qu'un index unique est ajouté, même sans perte réelle.

**4. Vérifier, puis nettoyer la session shell**

```bash
npx prisma db push          # doit répondre « already in sync »
unset DATABASE_URL NEON_URL
```

**5. Déployer l'image** (push sur `main`). Le schéma étant additif, la version en production
continue de fonctionner entre les étapes 3 et 5.

Le script relu de la dernière évolution est archivé dans
[`docs/sql/`](sql/2026-08-19_sessions-et-numero-sinistre.sql).

Changements en attente pour la prochaine mise en production :

| Objet                          | Nature                          | Impact sur les données existantes                                                                            |
| ------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `model Session`                | nouvelle table                  | Aucun. Les sessions ouvertes avec l'ancien cookie sont invalidées : les utilisateurs devront se reconnecter. |
| `Claim.claimNumber`            | colonne nullable + index unique | Aucun. Les sinistres antérieurs restent sans numéro.                                                         |
| `InsuranceStatus.UNDER_REVIEW` | nouvelle valeur d'énumération   | Aucun.                                                                                                       |

---

## 🐳 Dockerfile Multi-Stage & Probes

L'image Docker s'appuie sur Node 20 Alpine avec 3 étapes distinctes :

1. **deps** : Installation optimale avec cache npm et génération du client Prisma.
2. **builder** : Compilation du bundle SvelteKit via `@sveltejs/adapter-node`.
3. **runner** : Runtime léger (< 150Mo) incluant un Healthcheck HTTP sur la route `/api/health`.

### Test local du conteneur Docker :

```bash
docker build -t evenue-app .
docker run -p 5173:5173 -e DATABASE_URL="file:./dev.db" evenue-app
```
