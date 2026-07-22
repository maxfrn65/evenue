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

## Suivi des Arbitrages à venir

| ID | Domaine | Description / Sujet | Statut |
|---|---|---|---|
| ARB-001 | Architecture / Résilience | Prisma 7 + Circuit Breaker Engine natif | ✅ Validé |
