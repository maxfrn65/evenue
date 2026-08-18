# Observabilité as-code

Ce dossier versionne la configuration de supervision d'Evenue, pour qu'elle soit
reproductible et relue comme du code plutôt que reconstituée à la main dans une interface.

| Fichier                       | Contenu                                                    | Utilisable aujourd'hui                     |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `dashboard-evenue-mco.json`   | Dashboard Grafana « Maintien en condition opérationnelle » | ✅ oui                                     |
| `alert-rules-loki.yaml`       | Règles d'alerte sur les logs (Loki)                        | ✅ oui                                     |
| `alert-rules-prometheus.yaml` | Règles d'alerte sur les métriques applicatives             | ⚠️ nécessite un collecteur (voir plus bas) |

Les requêtes détaillées et les libellés de labels sont documentés dans
[../GRAFANA_MONITORING.md](../GRAFANA_MONITORING.md).

---

## Importer le dashboard

1. Grafana (Scaleway Cockpit) → **Dashboards** → **New** → **Import**.
2. Coller le contenu de `dashboard-evenue-mco.json`.
3. Sélectionner la source de données Loki lorsqu'elle est demandée.

Le dashboard n'embarque aucun identifiant de source de données : il expose deux variables,
`datasource` (choix de la source Loki) et `container` (nom du conteneur). Il est donc
importable tel quel dans n'importe quel projet Cockpit, sans édition préalable.

Les six panneaux couvrent les indicateurs du §3.2 du dossier : taux d'erreur 5xx, latence
p95 par route, état du Circuit Breaker Wakam, exceptions serveur, tentatives de connexion
échouées par IP, et démarrages à froid. Les métriques CPU / mémoire / instances restent sur
le dashboard `Scaleway → Serverless Containers Overview`, alimenté nativement.

---

## Créer les canaux de signalement

Les règles portent un label `canal` correspondant à la matrice de signalement du §3.4.
**Sans contact point configuré, une règle se déclenche sans notifier personne** — c'est le
point le plus souvent oublié.

| Sévérité        | Contact point à créer        | Déclencheur type                                                          | Délai de réaction visé |
| --------------- | ---------------------------- | ------------------------------------------------------------------------- | ---------------------- |
| SEV1 — Critique | `slack-urgence` + e-mail/SMS | Service indisponible, Circuit Breaker ouvert, taux 5xx > 1 %, force brute | Immédiat               |
| SEV2 — Majeur   | `slack-alertes`              | Latence > 2 s, mémoire > 85 %, exception serveur                          | < 1 h                  |
| SEV3 — Mineur   | GitHub Issues                | Anomalie non bloquante, tendance à surveiller                             | Prochain sprint        |

Dans Grafana : **Alerting → Contact points → Add contact point**, puis
**Notification policies** pour router sur le label `severity`.

Le canal SEV3 est déjà outillé côté dépôt : le modèle de fiche
`.github/ISSUE_TEMPLATE/anomalie.yml` reprend les champs du §4.3, et la sonde de
disponibilité (`.github/workflows/uptime-probe.yml`) ouvre automatiquement une fiche en cas
d'indisponibilité.

---

## Traiter le cas « No data »

Le conteneur passe à **zéro instance** en l'absence de trafic : il n'émet alors plus aucun
log, et les règles exprimées en ratio n'ont plus de dénominateur.

Configurer systématiquement **No data → OK** sur les règles de ratio. Laissées en
`Alerting`, elles déclencheraient une alerte critique chaque nuit — et une alerte qui crie à
tort finit par ne plus être lue du tout.

---

## Faire collecter `/metrics`

L'application expose `/metrics` au format d'exposition Prometheus (compteurs, histogramme de
latence, état du Circuit Breaker, échecs d'authentification, métriques processus). Cet
endpoint est prêt à être scrapé — mais **Scaleway Cockpit ne scrape pas les applications** :
il ingère les métriques en push (remote write / OTLP) avec un token.

Trois options, par ordre de coût croissant :

1. **Ne rien collecter** _(recommandé en l'état)_ — les mêmes KRI sont couverts par les
   règles Loki, qui fonctionnent déjà et n'ajoutent aucune infrastructure. `/metrics` reste
   consultable à la demande pour le diagnostic. C'est le choix retenu par défaut.
2. **Déployer un collecteur Grafana Alloy** dans un second conteneur serverless, configuré
   pour scraper `https://<url-app>/metrics` (avec `METRICS_TOKEN`) et faire un _remote write_
   vers l'endpoint Cockpit `https://<data-source-id>.metrics.cockpit.fr-par.scw.cloud/api/v1/push`.
   Coût réel : le collecteur doit tourner en continu (minimum 1 instance), il ne peut donc
   pas descendre à zéro comme l'application.
3. **Pousser depuis l'application** en OTLP vers Cockpit. Peu adapté ici : sur un conteneur
   qui scale à zéro, une instance de courte durée peut mourir avant son premier envoi
   périodique, et les points de mesure sont perdus.

Tant que l'option 1 est en vigueur, `alert-rules-prometheus.yaml` documente les règles
cibles mais reste sans données : ne pas l'importer, pour éviter des règles en échec
permanent dans l'interface d'alerting.
