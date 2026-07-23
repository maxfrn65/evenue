# Guide de Configuration Grafana, Loki & Cockpit Scaleway

Ce guide détaille la mise en place du dashboard de suivi de santé et des requêtes de logs pour Grafana Loki / Scaleway Cockpit pour la plateforme Evenue.

---

## 📊 Dashboard Metrics Prométhéennes (`/api/metrics`)

L'application expose en permanence un endpoint de métriques structuré sur `/api/metrics` :

```json
{
  "timestamp": "2026-07-23T20:10:00.000Z",
  "uptimeSeconds": 1420.5,
  "memoryUsageMb": 85,
  "circuitBreaker": {
    "state": "CLOSED",
    "failureCount": 0
  },
  "database": {
    "status": "HEALTHY",
    "totalListings": 6,
    "totalBookings": 1
  }
}
```

---

## 🔍 Requêtes Grafana Loki (LogQL)

Les logs de production sont émis au format JSON structuré sur `stdout`/`stderr` et collectés automatiquement par Scaleway Cockpit / Grafana Loki.

### 1. Filtrer toutes les erreurs HTTP 500 :
```logql
{service="evenue-app"} | json | level="ERROR" | statusCode=500
```

### 2. Suivre les basculements d'état du Circuit Breaker Wakam (Alertes Critiques) :
```logql
{service="evenue-app"} | json | level="ALERT" | context="CIRCUIT_BREAKER"
```

### 3. Calculer la latence moyenne par route (p95) :
```logql
avg by (path) (rate({service="evenue-app"} | json | durationMs [5m]))
```

---

## 🚨 Règles d'Alerte Grafana (Alerting Rules)

### Alerte 1 : Circuit Breaker Wakam en état OPEN
- **Condition** : `count_over_time({service="evenue-app"} | json | level="ALERT" [2m]) > 0`
- **Gravité** : `CRITICAL`
- **Action** : Notification Slack / PagerDuty.

### Alerte 2 : Taux d'erreurs HTTP 5xx > 2%
- **Condition** : `sum(rate({service="evenue-app"} | json | statusCode>=500 [5m])) / sum(rate({service="evenue-app"} [5m])) > 0.02`
- **Gravité** : `WARNING`
