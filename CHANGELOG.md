# Journal des versions déployées

Journal des évolutions d'Evenue, tenu au titre du maintien en condition opérationnelle
(compétence C4.3.2). Il documente, pour chaque version, le contenu déployé et les
correctifs associés.

**Conventions.** Versionnement sémantique (`majeure.mineure.correctif`) et
[Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `ci`, `test`,
`docs`, `chore`). Chaque évolution passe par une Pull Request numérotée, reliée à un ticket
ClickUp (`CU-xxx`) — la traçabilité va donc de la spécification au commit correctif, puis à
la version déployée.

**Correspondance.** `#N` renvoie à la Pull Request, `CU-xxx` au ticket ClickUp,
`ANO-xxx` à la fiche d'anomalie (GitHub Issues).

---

## Non publié

### Ajouté

- Endpoint `/metrics` au format d'exposition Prometheus : compteurs de requêtes HTTP par
  route et statut, histogramme de latence (bucket à 2 s aligné sur le seuil KRI), état et
  compteur d'ouvertures du Circuit Breaker Wakam, compteur d'échecs d'authentification,
  métriques processus (CPU, mémoire).
- Identifiant de corrélation `requestId` sur chaque ligne de log, renvoyé au client dans
  l'en-tête `x-request-id`.
- Journalisation structurée des échecs de connexion avec l'adresse IP, alimentant le KRI
  « > 50 tentatives/min sur une même IP ».
- Sonde de disponibilité externe (GitHub Actions, toutes les 15 min) sur la page publique,
  la sonde de santé, la recherche d'annonces et le refus de réservation anonyme ; une
  indisponibilité ouvre automatiquement une fiche d'anomalie.
- Règles d'alerte et dashboard Grafana versionnés dans `docs/observability/`.
- Modèle de fiche de consignation d'anomalie (`.github/ISSUE_TEMPLATE/anomalie.yml`).
- Protection facultative par jeton (`METRICS_TOKEN`) sur les endpoints de métriques.

### Corrigé

- `logger.alert()` préfixait la ligne avant le JSON, la rendant non parsable par Loki :
  toutes les règles d'alerte filtrant sur `level="ALERT"` étaient inopérantes.
- Les réponses 5xx étaient journalisées en `WARN`, indistinguables d'une erreur client.
- Les 404 étaient remontés comme exceptions serveur avec pile d'appels, noyant le niveau
  `ERROR` sous le balayage permanent des robots.
- Le script de déploiement Scaleway avalait ses erreurs et se terminait toujours en succès :
  la CI restait verte sans jamais déployer, et la production dérivait silencieusement.

---

## Versions déployées

| Version    | Réf. (PR / ticket) | Type            | Contenu déployé / correctifs documentés                                                                                                |
| ---------- | ------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **v1.0.0** | #8 / CU-020        | feat / security | Durcissement OWASP (dont le correctif **ANO-013**), accessibilité RGAA, recette exécutée (68 scénarios). Suite portée à 89 tests.      |
| v0.14.1    | `29a0bf0`          | fix             | Encapsulation `try/catch` des fonctions `load` SSR et repli sûr, pour prévenir les HTTP 500.                                           |
| v0.14.0    | #17 / CU-019       | feat            | Supervision : logger JSON structuré, middleware de durée des requêtes, endpoint de métriques, alertes Grafana/Loki et Circuit Breaker. |
| v0.13.2    | CU-018             | fix             | Correction du tag de l'action Scaleway (v2 → v0) ; correctifs Dockerfile (copie du client Prisma, `apk add`).                          |
| v0.13.1    | CU-018             | fix             | Passage de Node 20 à 22 (compatibilité du moteur _stream adapter_ de Prisma v7).                                                       |
| v0.13.0    | #16 / CU-018       | ci              | Pipeline CI/CD GitHub Actions, Dockerfile multi-stage, déploiement Scaleway Serverless.                                                |
| v0.12.0    | #15 / CU-017       | test            | Suite de tests automatisés et rapport de couverture (> 85 % de fonctions).                                                             |
| v0.11.0    | #14 / CU-016       | feat            | Composant de recherche réutilisable : autocomplétion de ville et sélection de plage de dates.                                          |
| v0.10.0    | #13 / CU-015       | feat            | Pages d'information, parcours « comment ça marche » hôte/voyageur, correction des liens de pied de page.                               |
| v0.9.2     | #12 / CU-014       | feat            | Déclaration de sinistre Wakam : RBAC hôte, fenêtre de 7 jours post-événement, contestation voyageur.                                   |
| v0.9.1     | #11 / CU-013       | feat            | Plages de disponibilité multiples, filtre de dates et sélecteur de dates Shadcn.                                                       |
| v0.9.0     | #10 / CU-012       | feat            | Messagerie instantanée et interface de conversation temps réel.                                                                        |
| v0.8.0     | #9 / CU-011        | feat            | Synchronisation iCal bidirectionnelle et prévention du double-booking.                                                                 |
| v0.7.0     | #7 / CU-009        | feat            | Déclaration de sinistre Wakam et générateur d'attestation PDF.                                                                         |
| v0.6.1     | #6 / CU-008        | feat            | Tableau de bord utilisateur : réservations, annonces hôte, annulation.                                                                 |
| v0.6.0     | #5 / CU-007        | feat            | Réservation, séquestre Stripe Connect et Circuit Breaker de l'assurance Wakam.                                                         |
| v0.5.0     | #4 / CU-005        | feat            | Refonte UX shadcn-svelte, carte interactive Leaflet et périmètre de réservation Wakam.                                                 |
| v0.4.0     | #3 / CU-004        | feat            | Catalogue d'annonces, carte interactive et page de détail.                                                                             |
| v0.3.0     | #2 / CU-003        | feat            | Authentification, hachage des mots de passe, routes API et KYC Stripe Connect.                                                         |
| v0.2.0     | #1 / CU-002        | feat            | Design System, composants de mise en page et bandeau de couverture Wakam.                                                              |
| v0.1.0     | CU-001             | feat            | Socle : SvelteKit, schéma Prisma PostgreSQL, Vitest et moteur Circuit Breaker.                                                         |

---

## Tenue du journal

Le journal est dérivé de l'historique Git (commits conventionnels et Pull Requests
fusionnées). Chaque entrée peut être retrouvée avec :

```bash
git log --oneline --merges
```

**Amélioration identifiée (§9 du dossier).** La pose de tags Git annotés par version et la
génération automatique de ce fichier (par exemple `semantic-release`) supprimeraient la
tenue manuelle et fiabiliseraient la correspondance version ↔ commit déployé.
