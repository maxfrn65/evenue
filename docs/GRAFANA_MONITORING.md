# Guide d'exploitation Grafana Loki & Cockpit Scaleway

Ce guide décrit comment interroger les logs de production d'Evenue et configurer les
règles d'alerte dans le Grafana managé de Scaleway Cockpit.

Toutes les requêtes de ce document ont été écrites à partir des labels **réellement
indexés** par Cockpit sur le conteneur de production (relevés dans Grafana → Explore →
Label browser). Elles sont copiables telles quelles.

---

## 1. Où sont les logs

Les logs de production sont émis au format JSON structuré sur `stdout` / `stderr` par
`src/lib/server/logger.ts` et collectés automatiquement par Scaleway Cockpit (Loki).
Aucun agent n'est à installer : l'intégration Serverless Containers → Cockpit est native.

- **Dashboard préconfiguré** : `Dashboards → Scaleway → Serverless Containers Logs`
- **Exploration libre** : `Explore` → data source Loki

### Labels indexés (utilisables dans le sélecteur `{...}`)

| Label           | Valeur en production                   |
| --------------- | -------------------------------------- |
| `project_id`    | `948705dd-4bd3-41e7-ada5-3923fc6e9814` |
| `project_name`  | `Evenue`                               |
| `region`        | `fr-par`                               |
| `resource_id`   | `4f4fbe17-1c2a-49e4-93bb-be471f23cce1` |
| `resource_name` | `evenue4616ab80-evenue`                |
| `resource_type` | `serverless_container`                 |
| `service_name`  | `serverless_container`                 |

### Métadonnées structurées (utilisables après un `|`, **pas** dans `{...}`)

| Champ               | Valeurs                                                  |
| ------------------- | -------------------------------------------------------- |
| `resource_instance` | `evenue4616ab80-evenue-00002-deployment-<hash>-<suffix>` |
| `stream`            | `stdout` \| `stderr`                                     |

> ⚠️ **Piège** : `service_name` vaut `serverless_container` — c'est le service _Scaleway_,
> pas l'application. Le champ `"service":"evenue-app"` émis par le logger est un champ
> **à l'intérieur** de la ligne JSON, jamais un label de flux. Un sélecteur du type
> `{service="evenue-app"}` ou `{service_name="evenue-app"}` ne retourne rien.

### Sélecteur de base

```logql
{resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
```

Variante robuste au renommage du conteneur (l'ID ne change pas) :

```logql
{resource_type="serverless_container", resource_id="4f4fbe17-1c2a-49e4-93bb-be471f23cce1"}
```

### ⚠️ Toujours pré-filtrer avant `| json`

Le flux mélange les lignes JSON de l'application et des sorties brutes du runtime
(`Listening on http://0.0.0.0:5173`, avertissements Node / `libpq`…). Sur ces lignes,
l'étape `| json` produit une erreur de parsing qui pollue les résultats et fausse les
agrégations. On isole donc systématiquement les logs applicatifs, puis on écarte les
erreurs de parsing résiduelles :

```logql
... |= `"service":"evenue-app"` | json | __error__=""
```

---

## 2. Requêtes LogQL

### 2.1 Erreurs HTTP 5xx

Le niveau de log suit la classe de statut : `5xx → ERROR`, `4xx → WARN`, le reste `INFO`.
Un `level="ERROR"` signifie donc toujours « le serveur a échoué ».

```logql
{resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
  |= `"context":"HTTP_REQUEST"`
  | json
  | __error__=""
  | level="ERROR"
```

Toutes les lignes d'une même requête partagent un champ `requestId`, également renvoyé au
client dans l'en-tête `x-request-id`. Pour dérouler un incident signalé par un utilisateur :

```logql
{resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
  |= `<request-id-fourni-par-l-utilisateur>`
```

### 2.2 Exceptions serveur non capturées

Émises par `handleError` dans `src/hooks.server.ts` (avec `stack`), sans champ `statusCode`.

```logql
{resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
  |= `"context":"SERVER_EXCEPTION"`
  | json
  | __error__=""
  | line_format `{{.path}} — {{.error}}`
```

### 2.3 Basculements du Circuit Breaker Wakam

Les lignes `ALERT` portent `alertMarker="CRITICAL_ALERT"` **dans** le JSON (le préfixe
textuel qui cassait le parsing a été supprimé) : le pré-filtre est donc à la fois rapide
et sûr.

```logql
{resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
  |= `CRITICAL_ALERT`
  | json
  | __error__=""
  | level="ALERT"
  | context="CIRCUIT_BREAKER"
```

### 2.4 Latence p95 par route

`rate()` compte des lignes par seconde et ne sait pas lire une valeur numérique : pour
agréger `durationMs` il faut `unwrap`.

```logql
quantile_over_time(0.95,
  {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
    |= `"context":"HTTP_REQUEST"`
    | json
    | __error__=""
    | unwrap durationMs [5m]
) by (path)
```

Variante médiane / p99 : remplacer `0.95` par `0.5` ou `0.99`.

### 2.5 Trafic par code de statut

```logql
sum by (statusCode) (
  count_over_time(
    {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
      |= `"context":"HTTP_REQUEST"`
      | json
      | __error__=""
      [5m]
  )
)
```

### 2.6 Chemins 404 les plus sollicités (bruit de scan)

Les 404 sont désormais journalisés en `HTTP_CLIENT_ERROR` niveau `WARN`, sans stack trace,
et ne polluent plus le niveau `ERROR`. Cette requête révèle la surface balayée par les
robots (`/metrics`, `/.env`, `/actuator/health`…).

```logql
sum by (path) (
  count_over_time(
    {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
      |= `"context":"HTTP_CLIENT_ERROR"`
      | json
      | __error__=""
      | statusCode = 404
      [5m]
  )
)
```

> Un profil **régulier** (un pic toutes les 15 / 30 / 60 s sur un même chemin) ne serait pas
> un robot mais un _scraper Prometheus_ configuré quelque part : à investiguer, car cela
> contredirait le § 4.

### 2.7 Démarrages à froid (scale-to-zero)

Utile pour interpréter `uptimeSeconds` et l'état du Circuit Breaker, qui sont remis à zéro
à chaque nouvelle instance.

```logql
sum by (resource_instance) (
  count_over_time(
    {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
      |= `Listening on http` [1h]
  )
)
```

### 2.8 Tout ce qui part sur stderr (runtime + application)

```logql
{resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
  | stream = `stderr`
```

---

## 3. Règles d'alerte Grafana

> **Le jeu de règles complet est versionné** dans
> [`observability/alert-rules-loki.yaml`](observability/alert-rules-loki.yaml), avec les
> seuils du référentiel KRI et les sévérités SEV1/2/3. La marche à suivre pour l'import et
> la création des canaux de signalement est dans
> [`observability/README.md`](observability/README.md). Les trois règles ci-dessous en sont
> le sous-ensemble minimal, détaillé pour une création manuelle dans l'interface.

À créer dans `Alerting → Alert rules`, sur la data source Loki de Cockpit.
Chaque règle a besoin d'un **contact point** configuré (`Alerting → Contact points`) —
sans lui, la règle se déclenche sans notifier personne.

### Alerte 1 — Circuit Breaker Wakam en OPEN

- **Gravité** : `CRITICAL`
- **Intervalle d'évaluation** : 1 min, `for: 0s` (on veut la notification immédiate)
- **Requête** :

```logql
sum(
  count_over_time(
    {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
      |= `CRITICAL_ALERT` [5m]
  )
)
```

- **Condition** : `IS ABOVE 0`
- **No data** : `OK` (l'absence de log est normale en scale-to-zero)

### Alerte 2 — Taux d'erreurs HTTP 5xx > 1 %

- **Gravité** : `SEV1` — seuil du référentiel KRI (bug critique en production)
- **Intervalle d'évaluation** : 1 min, `for: 5m`
- **Requête** :

```logql
sum(rate(
  {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
    |= `"context":"HTTP_REQUEST"` | json | __error__="" | statusCode >= 500 [5m]
))
/
sum(rate(
  {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
    |= `"context":"HTTP_REQUEST"` | json | __error__="" [5m]
))
```

- **Condition** : `IS ABOVE 0.01`
- **No data** : `OK` — sans trafic, le dénominateur vaut 0 et le ratio devient `NaN` ;
  laisser cette règle en `Alerting` sur `No data` produirait des fausses alertes chaque
  nuit.

### Alerte 3 — Exceptions serveur non capturées

- **Gravité** : `WARNING`
- **Requête** :

```logql
sum(
  count_over_time(
    {resource_type="serverless_container", resource_name="evenue4616ab80-evenue"}
      |= `"context":"SERVER_EXCEPTION"` [10m]
  )
)
```

- **Condition** : `IS ABOVE 0`
- **No data** : `OK`

> `SERVER_EXCEPTION` ne contient plus que de vraies erreurs serveur : les 404 sont sortis de
> cette catégorie, l'alerte n'a donc pas besoin de filtre anti-bruit.

---

## 4. Métriques

### Métriques d'infrastructure — disponibles nativement

Scaleway pousse automatiquement les métriques du conteneur dans Mimir (le backend
compatible Prometheus de Cockpit) : nombre de requêtes, erreurs, durée, instances,
CPU/mémoire. Elles sont visibles dans
`Dashboards → Scaleway → Serverless Containers Overview`. **Rien à installer.**

### Métriques applicatives — endpoint `/metrics` (format Prometheus)

L'application expose ses propres métriques au format d'exposition Prometheus
(`text/plain; version=0.0.4`), implémentées dans
[`src/lib/server/metrics.ts`](../src/lib/server/metrics.ts) :

| Métrique                                                | Type          | Indicateur couvert (KRI)         |
| ------------------------------------------------------- | ------------- | -------------------------------- |
| `evenue_http_requests_total`                            | counter       | Taux d'erreur 5xx, débit         |
| `evenue_http_request_duration_seconds`                  | histogram     | Temps de réponse (bucket à 2 s)  |
| `evenue_circuit_breaker_state`                          | gauge         | Circuit Breaker : 0 / 1 / 2      |
| `evenue_circuit_breaker_consecutive_failures`           | gauge         | Échecs consécutifs API Wakam     |
| `evenue_circuit_breaker_opened_total`                   | counter       | Historique des pannes partenaire |
| `evenue_auth_login_failures_total`                      | counter       | Tentatives de connexion échouées |
| `evenue_process_cpu_*`, `evenue_process_*_memory_bytes` | gauge/counter | CPU et mémoire du conteneur      |

Le label de route est l'identifiant de route SvelteKit (`/listings/[id]`), jamais le chemin
brut : un label par URL laisserait n'importe quel visiteur créer des séries à volonté.

**Collecte.** Cockpit ne _scrape_ pas les applications ; il ingère les métriques en push.
Cet endpoint est donc prêt à être collecté, mais rien ne le collecte par défaut. Les trois
options et l'option recommandée sont détaillées dans
[`observability/README.md`](observability/README.md) — en l'état, les mêmes KRI sont
couverts par les règles Loki, qui fonctionnent sans infrastructure supplémentaire.

**Portée.** Le conteneur scale à zéro : les compteurs sont par instance et repartent de
zéro à chaque démarrage à froid. Les règles s'expriment donc en `rate()` sur fenêtre,
jamais sur des totaux cumulés.

### Endpoint de santé `/api/metrics` (JSON)

```json
{
	"timestamp": "2026-08-15T01:12:31.360Z",
	"uptimeSeconds": 53.94,
	"memoryUsageMb": 171,
	"circuitBreaker": { "state": "CLOSED", "failureCount": 0 },
	"database": { "status": "HEALTHY", "totalListings": 6, "totalBookings": 1 }
}
```

Point de contrôle lisible par un humain, conservé pour le diagnostic ponctuel et la
vérification post-déploiement. Comme les valeurs sont propres à l'instance qui répond, il
ne remplace pas la supervision : pour l'état du Circuit Breaker, se fier aux **logs de
transition** (§ 2.3) ou à la gauge Prometheus.

**Protection.** Si la variable d'environnement `METRICS_TOKEN` est définie sur le
conteneur, `/metrics` et `/api/metrics` exigent `Authorization: Bearer <token>` et
répondent 401 sinon. Non définie, ils restent ouverts (développement local et démonstration
inchangés). Les comptages en base de `/api/metrics` sont mis en cache 15 s, pour qu'un
appel répété ne déclenche pas deux `COUNT` à chaque fois ni ne maintienne une instance
éveillée.

---

## 5. Suivi des correctifs

### Traité

| #   | Sujet                                                                                                                                         | Correctif                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `logger.alert()` préfixait la ligne avec `🚨 [CRITICAL_ALERT] ` avant le JSON, la rendant non parsable — tout filtre `level="ALERT"` échouait | Marqueur déplacé **dans** le JSON (`alertMarker`), plus aucun préfixe. Test de non-régression sur la ligne réellement écrite dans `logger.test.ts` |
| 2   | Les 5xx étaient journalisés en `WARN`, indistinguables d'un 4xx client                                                                        | Le niveau suit la classe de statut : `5xx → ERROR`, `4xx → WARN`, sinon `INFO`                                                                     |
| 3   | Aucun identifiant de corrélation                                                                                                              | `requestId` (UUID, ou en-tête `x-request-id` entrant s'il existe) présent sur chaque ligne et renvoyé au client                                    |
| 6   | Les 404 remontaient en `SERVER_EXCEPTION` niveau `ERROR` avec stack trace                                                                     | `handleError` court-circuite sous 500 : contexte `HTTP_CLIENT_ERROR`, niveau `WARN`, sans stack                                                    |
| —   | `/api/metrics` public et non authentifié, deux `COUNT` par appel                                                                              | Bearer token optionnel (`METRICS_TOKEN`) + cache 15 s sur les comptages                                                                            |
| 5   | Dashboards et règles d'alerte non versionnés                                                                                                  | Dashboard et règles Loki/Prometheus versionnés dans [`observability/`](observability/), importables sans édition préalable                         |
| —   | Aucune métrique applicative exposée                                                                                                           | Endpoint `/metrics` au format Prometheus : compteurs, histogramme de latence, gauges du Circuit Breaker, échecs d'authentification (§ 4)           |
| —   | Aucune sonde de disponibilité                                                                                                                 | Sonde externe toutes les 15 min (`.github/workflows/uptime-probe.yml`), qui ouvre une fiche d'anomalie en cas d'échec                              |
| —   | Aucune trace des échecs d'authentification                                                                                                    | Lignes `AUTH_FAILURE` avec l'IP source, alimentant le KRI « > 50 tentatives/min sur une même IP »                                                  |

### Reste à faire

| #   | Sujet                                      | Action                                                                                                                                                                                            |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | `userId` journalisé sur 100 % des requêtes | Donnée personnelle (pseudonyme) dans les logs : fixer et documenter la rétention de la data source Loki dans Cockpit (RGPD)                                                                       |
| 7   | Collecte des métriques applicatives        | Décision à acter : rester sur « métriques infra natives + métriques dérivées des logs » (recommandé), ou déployer un collecteur Alloy — voir [`observability/README.md`](observability/README.md) |
| 8   | Health check du conteneur                  | Le `HEALTHCHECK` du `Dockerfile` n'est lu que par Docker en local ; déclarer `/api/health` comme _health check_ dans la configuration du conteneur Scaleway                                       |
| 9   | Aucun contact point d'alerte               | Créer les contact points SEV1 / SEV2 (`Alerting → Contact points`), sans lesquels les règles se déclenchent sans notifier personne                                                                |
