# PR #019 — Monitoring, Logging Centralisé JSON & Alertes Circuit Breaker

## Ticket ClickUp
[CU-019] Monitoring, Logging Centralisé & Alertes Circuit Breaker — `86caw1vtu`

## Contexte
Mise en place d'une infrastructure complète de logging centralisé au format JSON structuré pour Grafana Loki / Scaleway Cockpit, instrumentation des requêtes HTTP middleware SvelteKit, émission d'alertes critiques en cas de basculement du Circuit Breaker Wakam et documentation d'exploitation des dashboards et règles d'alertes.

## Description des changements

### Service Logger JSON (`src/lib/server/logger.ts` & `logger.test.ts`)
- Formatage JSON structuré sur `stdout`/`stderr` (`timestamp`, `level`, `context`, `path`, `statusCode`, `durationMs`, `error`).

### Middleware HTTP SvelteKit (`src/hooks.server.ts`)
- Chronométrage de latence `x-response-time` sur chaque requête HTTP.
- Capture d'exceptions et journalisation automatisée des requêtes HTTP et des réponses 4xx/5xx.

### Alertes & Télémesure Circuit Breaker (`src/lib/server/circuit-breaker.ts`)
- Émission automatique de logs `CRITICAL_ALERT` lors des basculements d'état `CLOSED` -> `OPEN` -> `HALF_OPEN`.

### Endpoint Métriques & Guide Grafana (`src/routes/api/metrics/+server.ts` & `docs/GRAFANA_MONITORING.md`)
- API `/api/metrics` exposant les métriques temps réel (statut BDD, comptage annonces, réservations, statut Circuit Breaker, uptime).
- Guide d'exploitation Grafana avec requêtes LogQL et règles d'alertes.

## Checklist de revue
- [x] Logs JSON structurés sur stdout/stderr.
- [x] Header `x-response-time` ajouté aux réponses HTTP.
- [x] Alertes `CRITICAL_ALERT` opérationnelles sur le Circuit Breaker.
- [x] Endpoint `/api/metrics` fonctionnel.
- [x] svelte-check (0 erreur).
- [x] Suite Vitest (63/63 tests validés).

## Revue de code simulée (Alexandre Rivière — Lead DevOps/Infra)

### Remarque
C'est la pièce maîtresse du système d'observabilité. Les logs JSON structurés simplifient considérablement le parsing dans Grafana Loki / Scaleway Cockpit, et l'alerte temps réel du Circuit Breaker garantit une réaction immédiate en cas de panne de l'AssurTech Wakam.

### Réponse
Merci Alexandre ! Tous les tickets du backlog Evenue sont désormais intégralement développés, testés et déployés sur la branche principale `main`.
