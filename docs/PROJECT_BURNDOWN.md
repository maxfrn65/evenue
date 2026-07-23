# Suivi d'Avancement & Consommation J/H (Evenue — Bloc 2)

**Enveloppe globale attribuée** : **71 J/H**  
**Consommé à ce jour** : **33 J/H**  
**Reste à faire (RAF)** : **38 J/H**  

---

## Synthèse par Lot

| Lot | Désignation | Estimé (J/H) | Consommé (J/H) | Reste à faire | Statut |
|---|---|---|---|---|---|
| Lot 1 | Cadrage & Spécifications | 5 | 5 | 0 | ✅ Terminé (Bloc 1) |
| Lot 2 | UI/UX Design & Design System | 8 | 3 | 5 | 🚀 En cours |
| Lot 3 | Backend & BDD PostgreSQL/Prisma | 12 | 2 | 10 | 🚀 En cours |
| Lot 4 | Auth & KYC (Stripe Connect) | 6 | 2 | 4 | 🚀 En cours |
| Lot 5 | Frontend SvelteKit & UI | 12 | 12 | 0 | ✅ Terminé (MVP) |
| Lot 6 | Réservation & Séquestre Financier | 10 | 4 | 6 | 🚀 En cours |
| Lot 7 | API Assurance (Wakam & Circuit Breaker) | 8 | 4 | 4 | 🚀 En cours |
| Lot 8 | Tests & Qualité (Coverage > 80%) | 7 | 3 | 4 | 🚀 En cours |
| Lot 9 | Déploiement & CI/CD Scaleway | 3 | 0 | 3 | ⏳ En attente |
| **TOTAL** | | **71 J/H** | **38 J/H** | **33 J/H** | **En progression** |

---

## Historique des Tickets réalisés (`complete`)

| Ticket ID | Titre | Lot | Estimé | Consommé | Assignataire | Statut ClickUp | PR GitHub | Merge Git |
|---|---|---|---|---|---|---|---|---|
| **CU-001** | Setup socle SvelteKit, PostgreSQL Prisma & Circuit Breaker | Lot 3 | 2 J/H | 2 J/H | Alexandre Rivière | `complete` | [Commit eac5df7](https://github.com/maxfrn65/evenue/commit/eac5df7) | `main` |
| **CU-002** | Setup Design System & Composants UI Evenue | Lot 2 | 2 J/H | 2 J/H | Julie Dupuis | `complete` | [#1](https://github.com/maxfrn65/evenue/pull/1) | `main` |
| **CU-003** | Service Authentification & KYC Stripe Connect Express | Lot 4 | 2 J/H | 2 J/H | Sarah Chen | `complete` | [#2](https://github.com/maxfrn65/evenue/pull/2) | `main` |
| **CU-004** | Catalogue Logements & Recherche Géolocalisée Mapbox | Lot 5 | 2 J/H | 2 J/H | Thomas Moreau | `complete` | [#3](https://github.com/maxfrn65/evenue/pull/3) | `main` |
| **CU-005** | Refacto UX: Formats Recherche, Shadcn-Svelte, Carte & Scope Wakam | Lot 5 | 2 J/H | 2 J/H | Thomas Moreau | `complete` | [#4](https://github.com/maxfrn65/evenue/pull/4) | `main` |
| **CU-006** | Refacto DA: Thème Clair Minimaliste, Session Header & Fiche Dynamique | Lot 2 | 1 J/H | 1 J/H | Julie Dupuis | `complete` | `main` | `main` |
| **CU-007** | Moteur de Réservation, Séquestre Stripe & Assurance Wakam | Lot 6 | 2 J/H | 2 J/H | Sarah Chen | `complete` | [#5](https://github.com/maxfrn65/evenue/pull/5) | `main` |
| **CU-008** | Dashboard Utilisateur: Mes Réservations, Annonces & Migration Prisma v7 | Lot 5 | 2 J/H | 2 J/H | Thomas Moreau | `complete` | [#6](https://github.com/maxfrn65/evenue/pull/6) | `main` |
| **CU-009** | API Assurance: Déclaration de Sinistre & Attestation Wakam PDF | Lot 7 | 2 J/H | 2 J/H | Sarah Chen | `complete` | [#7](https://github.com/maxfrn65/evenue/pull/7) | `main` |
| **CU-010** | CRUD complet des Annonces Hôte & Édition sur Fiche Logement | Lot 5 | 2 J/H | 2 J/H | Thomas Moreau | `complete` | [#8](https://github.com/maxfrn65/evenue/pull/8) | `main` |
| **CU-011** | Synchronisation iCal Bidirectionnelle Anti Double-Booking | Lot 5 / 6 | 2 J/H | 2 J/H | Thomas Moreau | `complete` | [#9](https://github.com/maxfrn65/evenue/pull/9) | `main` |
| **CU-012** | Messagerie Instantanée & Notifications Temps Réel | Lot 5 | 2 J/H | 2 J/H | Julie Dupuis | `complete` | [#10](https://github.com/maxfrn65/evenue/pull/10) | `main` |
| **CU-013** | Plages de Disponibilité Hôte, Filtre de Recherche & DatePicker Shadcn | Lot 5 / 6 | 2 J/H | 2 J/H | Thomas Moreau | `complete` | [#11](https://github.com/maxfrn65/evenue/pull/11) | `main` |
| **CU-014** | Déclaration & Gestion Sinistres Wakam (Fenêtre 7j, Contestation & RBAC) | Lot 7 | 2 J/H | 2 J/H | Sarah Chen | `complete` | [#12](https://github.com/maxfrn65/evenue/pull/12) | `main` |
| **CU-015** | Pages d'Information, "Comment ça Marche" & Liens Morts Footer | Lot 5 | 2 J/H | 2 J/H | Julie Dupuis | `complete` | [#13](https://github.com/maxfrn65/evenue/pull/13) | `main` |
| **CU-016** | Refacto Moteur de Recherche Réutilisable (Tag Ville & DatePicker Airbnb) | Lot 5 | 2 J/H | 2 J/H | Thomas Moreau | `complete` | [#14](https://github.com/maxfrn65/evenue/pull/14) | `main` |
| **CU-017** | Automated Test Suite & Coverage Reports (>80%) | Lot 8 | 3 J/H | 3 J/H | Marc Dupont | `complete` | [#15](https://github.com/maxfrn65/evenue/pull/15) | `main` |

---

## Backlog des Tickets non réalisés (`to do`)

| Ticket ID | Titre | Lot | Estimé | Assignataire | Statut ClickUp | ClickUp ID |
|---|---|---|---|---|---|---|
| **CU-018** | Pipeline CI/CD GitHub Actions & Serverless Deploy Scaleway | Lot 9 | 3 J/H | Alexandre Rivière | `to do` | `86caw1vrz` |
| **CU-019** | Monitoring, Logging Centralisé & Alertes Circuit Breaker | Lot 9 | 2 J/H | Alexandre Rivière | `to do` | `86caw1vtu` |
