# Procédure de mise en service de la supervision

Ce qui ne peut pas être versionné : les opérations à réaliser dans le Grafana managé de
Scaleway Cockpit et dans la console Scaleway. À dérouler une fois, dans cet ordre.

Prérequis : l'application est déployée et émet ses logs (vérifiable par
`Dashboards → Scaleway → Serverless Containers Logs`).

---

## 1. Importer le dashboard

1. Grafana → **Dashboards** → **New** → **Import**.
2. Coller le contenu de `dashboard-evenue-mco.json`, puis **Load**.
3. Choisir un dossier de destination, puis **Import**.

Le dashboard ne demande **pas** de source de données à l'import : il n'en contient aucune
en dur. Une fois ouvert, deux sélecteurs apparaissent en haut de page :

- **Source Loki** — choisir la source Loki du projet ;
- **Conteneur** — pré-rempli avec `evenue4616ab80-evenue`.

Régler la plage de temps sur les **6 dernières heures**, puis **Save dashboard** pour figer
ces choix. Sans cette sauvegarde, la source est à resélectionner à chaque ouverture.

### Contrôle

Les panneaux « Requêtes par code de statut » et « Latence p95 par route » doivent afficher
des données. S'ils restent vides alors que le dashboard de logs Scaleway, lui, en montre :
le sélecteur de conteneur ne correspond pas au `resource_name` réel. Le relever dans
`Explore` en dépliant une ligne de log.

---

## 2. Créer les canaux de signalement

**Sans contact point, une règle se déclenche sans notifier personne** — et rien ne
distingue, dans l'interface, une règle qui n'a jamais sonné d'une règle dont l'alerte
n'atteint personne.

### 2.1 Préparer le webhook Slack

Dans Slack : **Apps** → créer une application → **Incoming Webhooks** → activer →
**Add New Webhook to Workspace** → choisir le canal → copier l'URL
(`https://hooks.slack.com/services/…`). Un webhook par canal : un pour `#urgence`, un pour
`#alertes`.

### 2.2 Créer les contact points

Grafana → **Alerting** → **Contact points** → **+ Add contact point**.

| Nom             | Intégration | Destination        |
| --------------- | ----------- | ------------------ |
| `slack-urgence` | Slack       | webhook `#urgence` |
| `slack-alertes` | Slack       | webhook `#alertes` |

Un contact point accepte **plusieurs intégrations** : sur `slack-urgence`, ajouter un canal
secondaire (e-mail ou webhook SMS) pour tenir l'exigence « SMS/email aux fondateurs » du
§3.4. Si l'intégration **Email** n'est pas proposée, c'est que le SMTP n'est pas
configurable sur le Grafana managé — passer alors par un webhook vers un service tiers.

### 2.3 Tester — l'étape à ne pas sauter

Sur l'écran d'édition du contact point, bouton **Test** → **Send test notification**.

Un message doit arriver dans Slack **dans la minute**. Tant que ce test n'a pas abouti, le
dispositif d'alerte n'existe pas : il est seulement configuré. Refaire le test pour chaque
contact point.

### 2.4 Router les alertes vers le bon canal

Grafana → **Alerting** → **Notification policies** → sur la politique par défaut,
**+ New child policy** :

| Condition (matcher) | Contact point   | Repeat interval |
| ------------------- | --------------- | --------------- |
| `severity = SEV1`   | `slack-urgence` | 1 h             |
| `severity = SEV2`   | `slack-alertes` | 4 h             |

Le label `severity` est porté par chaque règle (§3 ci-dessous) : c'est lui qui fait le lien
entre la règle et son canal.

---

## 3. Créer les règles d'alerte

Grafana → **Alerting** → **Alert rules** → **+ New alert rule**, une fois par règle de
`alert-rules-loki.yaml`.

### 3.1 Requête et condition

Section **Define query and alert condition** :

1. Source de données : **Loki**, en mode **Code**.
2. Coller l'expression LogQL de la règle, **sans la comparaison finale**.
   Exemple pour le taux d'erreur : coller la division seule, sans le `> 0.01`.
3. Conserver les expressions proposées par Grafana : **Reduce** (`Last`) puis
   **Threshold**.
4. Porter le seuil dans **Threshold** : `IS ABOVE 0.01`.

Le seuil vit ainsi dans l'interface, où il est lisible et modifiable, plutôt que noyé dans
la requête. Les fichiers YAML, eux, embarquent la comparaison car c'est le format attendu
par l'API ruler.

| Règle                   | Seuil (Threshold) | Sévérité |
| ----------------------- | ----------------- | -------- |
| Taux d'erreur 5xx       | `IS ABOVE 0.01`   | SEV1     |
| Circuit Breaker ouvert  | `IS ABOVE 0`      | SEV1     |
| Tentatives de connexion | `IS ABOVE 50`     | SEV1     |
| Exception serveur       | `IS ABOVE 0`      | SEV2     |
| Latence p95             | `IS ABOVE 2000`   | SEV2     |

### 3.2 Cadence d'évaluation

Section **Set evaluation behavior** : dossier, groupe d'évaluation (intervalle **1 min**),
et **pending period** = le `for:` de la règle — `0s` sur les SEV1 (notification immédiate),
`5m` à `10m` sur les SEV2 (ne pas sonner sur un pic isolé).

### 3.3 « No data » — le réglage qui évite les fausses alertes nocturnes

Section **Configure no data and error handling** :

- **Alert state if no data or all values are null** → **Normal**
- **Alert state if execution error or timeout** → **Error**

Le conteneur descend à **zéro instance** sans trafic : il n'émet alors plus aucun log, les
requêtes ne renvoient rien, et les ratios n'ont plus de dénominateur. Laissé sur `No Data`
ou `Alerting`, cela déclenche une alerte critique **chaque nuit** — et une alerte qui crie à
tort cesse d'être lue.

`Error` est conservé sur les erreurs d'exécution : une requête cassée doit se voir.

### 3.4 Labels

Section **Configure labels and notifications** : ajouter `severity` = `SEV1` ou `SEV2`.
Sans ce label, la politique de notification ne route rien et l'alerte reste silencieuse.

### 3.5 Contrôle

Vérifier qu'une règle atteint bien son canal : abaisser temporairement un seuil pour forcer
le déclenchement — `IS ABOVE 0` sur le taux d'erreur suffit — attendre la notification
Slack, puis **remettre le seuil d'origine**.

---

## 4. Fixer la rétention des logs

Console Scaleway → **Cockpit** → onglet **Data sources** → la source **Loki** du projet →
période de rétention → **30 jours**.

Justification à conserver pour le dossier : chaque ligne `HTTP_REQUEST` porte un `userId` et
chaque ligne `AUTH_FAILURE` une adresse IP. Trente jours couvrent le post-mortem d'incident
et le calcul mensuel du SLO 99,9 % sans conserver de données personnelles au-delà de leur
utilité (RGPD, minimisation). Si cette valeur exacte n'est pas proposée, retenir l'option
immédiatement **inférieure**.

Le paramètre est aussi accessible en ligne de commande ; découvrir la syntaxe exacte avec :

```bash
scw cockpit datasource list
scw cockpit datasource update --help
```

---

## 5. Déclarer le health check du conteneur

Le `HEALTHCHECK` du `Dockerfile` n'est lu que par Docker en local : **les Serverless
Containers l'ignorent**. La sonde doit être déclarée sur le conteneur lui-même.

Console Scaleway → **Containers** → le conteneur → **Paramètres** → section _Health check_ :
type **HTTP**, chemin **`/api/health`**, intervalle **30 s**, seuil d'échec **3**.

En ligne de commande (noms d'arguments donnés par `scw container container update --help`) :

```bash
scw container container update <container-id> \
  liveness-probe.http.path=/api/health \
  liveness-probe.interval=30s \
  liveness-probe.failure-threshold=3
```

`/api/health` est délibérément le bon point de contrôle : il ne touche pas la base de
données, donc une lenteur de Neon ne fait pas redémarrer un conteneur par ailleurs sain.
Pour observer la santé applicative _avec_ la base, c'est `/api/metrics` qu'il faut appeler,
à la demande.

---

## Récapitulatif de recette

| #   | Contrôle                | Preuve attendue                                                    |
| --- | ----------------------- | ------------------------------------------------------------------ |
| 1   | Dashboard importé       | Les panneaux de trafic et de latence affichent des données         |
| 2   | Contact points créés    | **Send test notification** reçu dans Slack                         |
| 3   | Politiques de routage   | Un enfant par sévérité, sur le label `severity`                    |
| 4   | Règles créées           | Cinq règles, `No data → Normal`, label de sévérité posé            |
| 5   | Chaîne d'alerte validée | Seuil abaissé volontairement → notification reçue → seuil restauré |
| 6   | Rétention Loki          | 30 jours sur la source Loki                                        |
| 7   | Health check            | `/api/health` déclaré sur le conteneur, en HTTP                    |
