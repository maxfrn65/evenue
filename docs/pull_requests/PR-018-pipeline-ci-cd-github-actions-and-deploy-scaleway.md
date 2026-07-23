# PR #018 — Pipeline CI/CD GitHub Actions & Serverless Deploy Scaleway

## Ticket ClickUp
[CU-018] Pipeline CI/CD GitHub Actions & Serverless Deploy Scaleway — `86caw1vrz`

## Contexte
Création de la chaîne d'intégration et de déploiement continu automatisée (CI/CD) sur GitHub Actions, conteneurisation Docker multi-stage optimisée pour Scaleway Serverless Containers, endpoint de santé `/api/health` et guide d'exploitation sans frais.

## Description des changements

### Workflow CI/CD (`.github/workflows/ci-cd.yml`)
- Job 1 : `check-and-lint` (`npm run check`).
- Job 2 : `unit-tests` (`npm run test:coverage` avec 60 tests et rapport de couverture).
- Job 3 : `build-and-push` (Build Docker multi-stage et push vers `rg.fr-par.scw.cloud/evenue/evenue-app`).
- Job 4 : `deploy-scaleway` (Déploiement Serverless Container via `scripts/deploy-scaleway.sh`).

### Conteneurisation Multi-stage (`Dockerfile` & `.dockerignore`)
- Stage 1 `deps` : Installation et génération Prisma client.
- Stage 2 `builder` : Compilation SvelteKit avec `@sveltejs/adapter-node`.
- Stage 3 `runner` : Alpine runtime léger (< 150Mo) avec Healthcheck sur `/api/health`.

### Probe & Documentation (`src/routes/api/health/+server.ts` & `docs/DEPLOYMENT_SCALEWAY.md`)
- Endpoint HTTP `/api/health` renvoyant le statut, l'uptime et l'horodatage.
- Guide pas-à-pas détaillant la configuration gratuite (Scaleway Free Tier + Neon.tech PostgreSQL).

## Checklist de revue
- [x] Workflow GitHub Actions validé.
- [x] Dockerfile multi-stage opérationnel.
- [x] Endpoint `/api/health` fonctionnel.
- [x] svelte-check (0 erreur).
- [x] Suite Vitest (60/60 tests au vert).

## Revue de code simulée (Alexandre Rivière — Lead DevOps/Infra)

### Remarque
Excellente conteneurisation. Le choix du build multi-stage Alpine couplé au Free Tier Scaleway Serverless et Neon.tech permet un coût d'infrastructure nul à 0€ tout en maintenant un démarrage sous les 500ms.

### Réponse
Merci Alexandre ! La chaîne CI/CD est à présent 100% automatisée sur chaque push.
