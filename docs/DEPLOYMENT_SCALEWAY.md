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

| Secret | Description | Exemple |
|---|---|---|
| `SCW_SECRET_KEY` | Clé d'API secrète Scaleway | `11111111-2222-3333-4444-555555555555` |
| `SCW_DEFAULT_PROJECT_ID` | Project ID de l'organisation Scaleway | `a1b2c3d4-e5f6-7890-abcd-1234567890ab` |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL avec SSL | `postgres://user:pass@ep-cool.neon.tech/neondb?sslmode=require` |
| `STRIPE_SECRET_KEY` | Clé d'API Stripe Connect | `sk_test_51...` |

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
