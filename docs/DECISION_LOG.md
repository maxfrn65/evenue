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

## Suivi des Arbitrages

| ID | Domaine | Description / Sujet | Statut |
|---|---|---|---|
| ARB-001 | Architecture / Résilience | Prisma 7 + Circuit Breaker Engine natif | ✅ Validé |
| ARB-002 | UI/UX / Transparence | Design System Sombre, Svelte 5 Runes & Bannière Wakam | ✅ Validé |
