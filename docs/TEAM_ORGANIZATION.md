# Organisation & Matrice de l'Équipe Fictive (Evenue — Bloc 2 & 3)

Ce document formalise l'organisation de l'équipe projet fictive simulée pour l'évaluation du **Bloc 3** (« Coordonner et piloter un projet de développement »).

---

## 1. Composition de l'Équipe Projet & Profils Budget

Conformément au cadrage budgétaire du Bloc 1 (Enveloppe globale de 54 475 € pour 71 J/H) :

| Nom & Prénom | Rôle / Spécialité | TJM (€/j) | Responsabilités Principales | Champ ClickUp |
|---|---|---|---|---|
| **Alexandre Rivière** | Lead Dev / Architecte Logiciel | 600 €/j | Socle technique, architecture SvelteKit/Prisma, Circuit Breaker, Sécurité OWASP, CI/CD & Cloud Scaleway | `Alexandre Rivière (Lead Dev / Architecte)` |
| **Sarah Chen** | Développeuse Backend & BDD | 450 €/j | Schéma PostgreSQL, migrations Prisma, routes serveur SvelteKit, APIs Stripe Connect & Wakam | `Sarah Chen (Dev Backend)` |
| **Thomas Moreau** | Développeur Frontend | 400 €/j | Composants Svelte 5, intégration UI, réactivité, intégration Mapbox & tunnel de réservation | `Thomas Moreau (Dev Frontend)` |
| **Julie Dupuis** | UI/UX Designer | 450 €/j | Design System, charte graphique, maquettes, composant de transparence `CoverageBanner` | `Julie Dupuis (UI/UX Designer)` |
| **Marc Dupont** | QA Lead / Ingénieur Test | 400 €/j | Strategie de tests Vitest/Playwright, audits de couverture > 80 %, revues de code & recettes | `Marc Dupont (QA / Testeur)` |

---

## 2. Configuration dans ClickUp

Deux **Champs Personnalisés (Custom Fields)** ont été directement créés et configurés dans votre espace ClickUp :

1. **`Assignataire Fictif`** (Menu déroulant) : Permet de rattacher explicitement chaque ticket ClickUp à son responsable d'équipe fictif.
2. **`Lot Projet`** (Menu déroulant) : Rattache le ticket à l'un des 9 lots de la méthodologie de cadrage.

---

## 3. Matrice d'Affectation des Tickets par Lot

| Lot | Désignation du Lot | Estimé (J/H) | Responsable Principal | Relecteur / QA |
|---|---|---|---|---|
| **Lot 1** | Cadrage & Spécifications | 5 J/H | Alexandre Rivière | Commanditaire |
| **Lot 2** | UI/UX Design & Design System | 8 J/H | Julie Dupuis | Thomas Moreau |
| **Lot 3** | Backend & BDD PostgreSQL/Prisma | 12 J/H | Alexandre Rivière / Sarah Chen | Marc Dupont |
| **Lot 4** | Auth & KYC (Stripe Connect) | 6 J/H | Sarah Chen | Alexandre Rivière |
| **Lot 5** | Frontend SvelteKit & UI | 12 J/H | Thomas Moreau | Julie Dupuis |
| **Lot 6** | Réservation & Séquestre Financier | 10 J/H | Sarah Chen / Thomas Moreau | Alexandre Rivière |
| **Lot 7** | API Assurance (Wakam & Circuit Breaker) | 8 J/H | Alexandre Rivière | Marc Dupont |
| **Lot 8** | Tests & Qualité (Coverage > 80%) | 7 J/H | Marc Dupont | Alexandre Rivière |
| **Lot 9** | Déploiement & CI/CD Scaleway | 3 J/H | Alexandre Rivière | Marc Dupont |

---

## 4. Historique des Affectations Réalisées

- **CU-001** : `Assignataire Fictif` = **Alexandre Rivière** | `Lot Projet` = **Lot 3** | Relecteur = **Marc Dupont**
- **CU-002** : `Assignataire Fictif` = **Julie Dupuis** | `Lot Projet` = **Lot 2** | Relecteur = **Thomas Moreau**
