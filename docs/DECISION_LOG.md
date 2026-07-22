# Journal des Arbitrages & Décisions Techniques (Evenue — Bloc 2)

Ce registre consigne l'ensemble des décisions d'architecture, de sécurité et d'arbitrage fonctionnel prises au cours du développement. Il constitue la preuve d'arbitrage pour l'évaluation du **Bloc 3**.

---

## Arbitrage #001 — Choix de Prisma 7 & Pattern Circuit Breaker Native Class

- **Date** : 22 Juillet 2026
- **Ticket ClickUp** : [[CU-001]](https://app.clickup.com/t/86cavjjjz)
- **Contexte** : Initialisation de la couche de persistance et de la résilience du système face aux dépendances tierces (Wakam AssurTech API).
- **Options envisagées** :
  1. Utiliser un ORM alternatif ou SQL brut.
  2. Utiliser une bibliothèque tierce pour le Circuit Breaker (ex. Opossum).
  3. Développer un module Circuit Breaker TypeScript natif à 3 états (*CLOSED*, *OPEN*, *HALF_OPEN*) sur-mesure.
- **Décision & Justification** :
  - **Prisma 7 + PostgreSQL** : Retenu pour la sécurité du typage, la garantie des transactions ACID indispensables aux séquestres financiers, et les migrations déclaratives.
  - **Circuit Breaker Natif TypeScript** : Retenu plutôt qu'une dépendance lourde pour garder le contrôle total sur le fallback d'assurance, éliminer la dette technique inutile, et garantir un temps d'exécution < 5ms sans surcharge runtime.

---

## Arbitrage #002 — Design System Thématique, Svelte 5 Runes & Bannière Transparence Wakam

- **Date** : 22 Juillet 2026
- **Ticket ClickUp** : [[CU-002]](https://app.clickup.com/t/86cavjr54) | **GitHub PR** : [#1](https://github.com/maxfrn65/evenue/pull/1)
- **Contexte** : Création du Design System Evenue et mise en place de la transparence tarifaire et d'assurance réclamée au cadrage.
- **Options envisagées** :
  1. Utiliser Tailwind v3 avec classes utilitaires dispersées.
  2. Masquer les conditions d'assurance dans une sous-page secondaire.
  3. Intégrer un composant dédié `CoverageBanner` directement sur la page d'accueil avec les règles « Couvert / Non couvert » et adopter Svelte 5 Runes (`$props()`).
- **Décision & Justification** :
  - **Bannière de Transparence `CoverageBanner`** : Intégrée nativement sur le Héro pour lever immédiatement les craintes des hôtes (dégâts) et des invités (légalité des soirées).
  - **Migrer sur Svelte 5 Runes (`$props()`)** : Assure la conformité avec la dernière version majeure du framework.

---

## Arbitrage #003 — Hashage Scrypt, Adaptateur PrismaPg & KYC Délégation Stripe Connect

- **Date** : 22 Juillet 2026
- **Ticket ClickUp** : [[CU-003]](https://app.clickup.com/t/86cavk2c8) | **GitHub PR** : [#2](https://github.com/maxfrn65/evenue/pull/2)
- **Contexte** : Implémentation du service d'authentification et de vérification d'identité des Hôtes.
- **Options envisagées** :
  1. Stocker des documents d'identité (Passeports/RIB) en interne.
  2. Utiliser un hash MD5/SHA256 pour les mots de passe.
  3. Utiliser scrypt avec timingSafeEqual et déléguer le KYC à Stripe Connect Express API.
- **Décision & Justification** :
  - **Délégation KYC à Stripe Connect Express** : Annule la responsabilité RGPD de stockage des pièces sensibles et respecte le Security by Design.
  - **Scrypt & timingSafeEqual** : Sécurise les mdp et élimine les attaques par canal auxiliaire (timing attacks).
  - **Adaptateur PrismaPg** : Assure la compatibilité Prisma 7 et la gestion des pools de connexions PostgreSQL.

---

## Arbitrage #004 — Moteur de Recherche Géolocalisée, Filtres Événements & Repères Mapbox

- **Date** : 22 Juillet 2026
- **Ticket ClickUp** : [[CU-004]](https://app.clickup.com/t/86cavk7q0) | **GitHub PR** : [#3](https://github.com/maxfrn65/evenue/pull/3)
- **Contexte** : Mise en place du catalogue de lieux événements et de la recherche géolocalisée.
- **Options envisagées** :
  1. Recherche textuelle basique sans filtrage par type d'événement ni capacité d'accueil.
  2. Intégration de filtres avancés (Ville, Prix/soirée, Capacité convives, Types d'événements autorisés) combinée à une carte interactive géolocalisée avec repères dynamiques.
- **Décision & Justification** :
  - **Recherche multicritère événementielle** : Permet aux organisateurs de trouver instantanément des lieux acceptant spécifiquement les soirées et mariages sans risquer les annulations pour mensonge.

---

## Arbitrage #005 — Composants UI Shadcn-Svelte, Carte Leaflet & Scope Restreint Wakam

- **Date** : 22 Juillet 2026
- **Ticket ClickUp** : [[CU-005]](https://app.clickup.com/t/86cavq44n) | **GitHub PR** : [#4](https://github.com/maxfrn65/evenue/pull/4)
- **Contexte** : Refactorisation UX globale, composants shadcn-svelte et ajustement du scope d'affichage de la bannière Wakam.
- **Options envisagées** :
  1. Conserver des balises HTML brutes et des boutons hétérogènes.
  2. Remplacer l'intégralité des boutons, cartes, badges, inputs et selects par des composants shadcn-svelte réutilisables (`Button`, `Card`, `Input`, `Label`, `Badge`, `Select`).
  3. Restreindre la bannière `CoverageBanner` au tunnel de réservation uniquement (`/bookings/new`).
- **Décision & Justification** :
  - **Système de composants Shadcn-Svelte** : Assure la cohérence visuelle, la maintenabilité et la prise en charge native des liens `href` sur les boutons.
  - **Restreindre la bannière Wakam au tunnel** : Évite la surcharge visuelle globale et concentre l'élément de rassurance au moment exact de l'engagement de paiement.
  - **Carte Leaflet / OpenStreetMap** : Remplacé le composant statique par de véritables tuiles interactives sombres et des marqueurs cliquables.

---

## Suivi des Arbitrages

| ID | Domaine | Description / Sujet | Statut |
|---|---|---|---|
| ARB-001 | Architecture / Résilience | Prisma 7 + Circuit Breaker Engine natif | ✅ Validé |
| ARB-002 | UI/UX / Transparence | Design System Sombre, Svelte 5 Runes & Bannière Wakam | ✅ Validé |
| ARB-003 | Sécurité / Auth & KYC | Scrypt, PrismaPg & Onboarding Stripe Connect Express | ✅ Validé |
| ARB-004 | Frontend / Géolocalisation | Moteur de recherche multicritère & Carte Mapbox | ✅ Validé |
| ARB-005 | UI/UX / System | Composants Shadcn-Svelte, Carte Leaflet & Scope Wakam | ✅ Validé |
