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
2. Coller le contenu de `dashboard-evenue-mco.json`, puis **Load**.
3. Une fois le dashboard ouvert, choisir la source Loki dans le sélecteur **Source Loki** en
   haut de page, puis **Save dashboard**.

Le dashboard n'embarque aucun identifiant de source de données : il expose deux variables,
`datasource` (choix de la source Loki) et `container` (nom du conteneur). Il est donc
importable tel quel dans n'importe quel projet Cockpit, sans édition préalable — mais il ne
demande rien à l'import, la source se choisit après ouverture.

**La procédure console complète** — contact points, règles d'alerte, rétention, health
check — est détaillée dans [PROCEDURE-CONSOLE.md](PROCEDURE-CONSOLE.md).

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

### Décision actée : aucun collecteur

**Aucun collecteur n'est déployé, et c'est un choix assumé.** Les mêmes KRI sont couverts
par les règles Loki, qui fonctionnent déjà et n'ajoutent aucune infrastructure ;
`/metrics` reste exposé et exploité à la demande pour le diagnostic.

Les deux options écartées, pour mémoire :

- **Collecteur Grafana Alloy** dans un second conteneur serverless, scrapant
  `https://<url-app>/metrics` puis faisant un _remote write_ vers
  `https://<data-source-id>.metrics.cockpit.fr-par.scw.cloud/api/v1/push`. Écartée pour son
  coût : le collecteur doit tourner en continu (minimum 1 instance) et ne peut donc pas
  descendre à zéro comme l'application.
- **Push OTLP depuis l'application**. Écartée pour son inadéquation au scale-to-zero : une
  instance de courte durée peut mourir avant son premier envoi périodique, et les points de
  mesure sont alors perdus.

En conséquence, `alert-rules-prometheus.yaml` documente les règles cibles mais **ne doit pas
être importé** : sans données, ses règles resteraient en échec permanent dans l'interface
d'alerting. Le fichier est conservé pour le jour où un collecteur serait déployé.

---

## Rétention des logs (RGPD)

Chaque ligne `HTTP_REQUEST` porte un `userId` et chaque ligne `AUTH_FAILURE` une adresse IP.
Ce sont des données personnelles — pseudonymes pour le premier, directement identifiantes
pour la seconde — et leur conservation doit être **bornée et justifiée**.

**Rétention retenue : 30 jours** sur la data source Loki. Ce choix couvre le besoin
d'exploitation (post-mortem d'incident, calcul mensuel du SLO 99,9 %) sans conserver
d'historique au-delà de son utilité.

À appliquer dans la console Scaleway : **Cockpit → Data sources → la source Loki du projet
→ période de rétention**. Si la valeur exacte n'est pas proposée, retenir l'option
immédiatement inférieure plutôt que supérieure : la minimisation prime.

---

## Accès aux endpoints de métriques

`/metrics` et `/api/metrics` sont **fermés au public**. Le garde
(`src/lib/server/metrics-auth.ts`) fonctionne en _fail closed_ :

| Contexte             | `METRICS_TOKEN` | Comportement                                                                                        |
| -------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| Production           | défini          | `Authorization: Bearer <token>` exigé, sinon **401**                                                |
| Production           | absent          | Endpoints **désactivés** (404), et la anomalie de configuration est journalisée une fois en `ERROR` |
| Développement / test | indifférent     | Endpoints ouverts                                                                                   |

Autrement dit, oublier la variable en production **ferme** l'accès au lieu de le rouvrir.

Générer un jeton et le poser sur le conteneur (Scaleway → Containers → Variables
d'environnement, en variable **secrète**) :

```bash
openssl rand -hex 32
```
