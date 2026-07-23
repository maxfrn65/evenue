# Suivi d'Avancement & Consommation J/H (Evenue — Bloc 2)

**Enveloppe globale attribuée** : **71 J/H**  
**Consommé à ce jour** : **24 J/H**
**Reste à faire (RAF)** : **47 J/H**

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
| Lot 7 | API Assurance (Wakam & Circuit Breaker) | 8 | 2 | 6 | 🚀 En cours |
| Lot 8 | Tests & Qualité (Coverage > 80%) | 7 | 0 | 7 | ⏳ En attente |
| Lot 9 | Déploiement & CI/CD Scaleway | 3 | 0 | 3 | ⏳ En attente |
| **TOTAL** | | **71 J/H** | **29 J/H** | **42 J/H** | **En progression** |

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

---

## Backlog des Tickets non réalisés (`to do`)

| Ticket ID | Titre | Lot | Estimé | Assignataire | Statut ClickUp | ClickUp ID |
|---|---|---|---|---|---|---|
| **CU-014** | Déclaration & Gestion des Sinistres Wakam (Fenêtre 48h Hôte, Contestation Locataire & Gel Séquestre) | Lot 7 | 2 J/H | Sarah Chen | `to do` | `86caw6nht` |
| **CU-015** | Automated Test Suite & Coverage Reports (>80%) | Lot 8 | 3 J/H | Marc Dupont | `to do` | `86caw1vqp` |
| **CU-016** | Pipeline CI/CD GitHub Actions & Serverless Deploy Scaleway | Lot 9 | 3 J/H | Alexandre Rivière | `to do` | `86caw1vrz` |
| **CU-017** | Monitoring, Logging Centralisé & Alertes Circuit Breaker | Lot 9 | 2 J/H | Alexandre Rivière | `to do` | `86caw1vtu` |
