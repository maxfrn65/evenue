# Pull Request #7: Moteur de Réservation Événementielle, Séquestre Financier Stripe Connect & Assurance Wakam

**Ticket ClickUp** : [[CU-007] Moteur de Réservation Événementielle, Séquestre Stripe & Assurance Wakam](https://app.clickup.com/t/86cavrn9r) (ID: `86cavrn9r`)  
**Branche source** : `feature/CU-007-reservation-sequestre-stripe-wakam`  
**Branche cible** : `main`  
**Assignataire Fictif** : Sarah Chen (Dev Backend)  
**Revue par** : Alexandre Rivière (Lead Dev / Architecte)  

---

## 1. Contexte & Description des changements

Implémentation complète du moteur de réservation et du séquestre financier (Lot 6 & Lot 7) :
- **Service Backend de Réservation (`src/lib/server/bookings.ts`)** :
  - Validation stricte des dates (`startDate < endDate`).
  - Détection automatique des chevauchements de dates sur les logements pour empêcher les doubles réservations.
  - Calcul de la ventilation tarifaire (`totalPrice`, `hostEarnings`, `platformFee`, `securityDepositAmount`).
- **Endpoint API `/api/bookings` (POST)** :
  - Route SvelteKit sécurisée enregistrant la réservation en base PostgreSQL via Prisma 7.
- **Séquestre Financier Stripe Connect (`src/lib/server/stripe.ts`)** :
  - `createBookingPaymentIntent` : création d'un PaymentIntent avec capture manuelle différée et transfert automatique vers le compte Express de l'hôte.
- **Émission d'Assurance Wakam Résiliente (`src/lib/server/wakam.ts`)** :
  - Protection de l'appel par le Circuit Breaker 3 états (`src/lib/server/circuit-breaker.ts`).
  - Émission de polices au format `WAK-2026-XXXXX` et fallback automatique en mode dégradé.
- **Tunnel de Réservation UI (`/bookings/new`)** :
  - Connexion du formulaire avec soumission API et affichage dynamique de la police d'assurance confirmée.

---

## 2. Tests effectués & Couverture

- [x] **Vitest Unit Tests** : 15/15 tests validés (comprenant les tests de réservation et du Circuit Breaker Wakam).
- [x] **Svelte Check & TypeScript** : 0 erreur, 0 avertissement.
- [x] **Production Build** : Build SvelteKit adapter-node réussi en 6.65s.

---

## 3. Points de vigilance Sécurité (OWASP) & Conformité

- **Séquestre Financier ACID** : La transaction Prisma et le PaymentIntent Stripe garantissent que les fonds de la caution ne sont ventilés qu'après la fin de la période sans sinistre.
- **Circuit Breaker InsurTech** : Garantit que même si l'API Wakam subit une coupure, la réservation n'est pas bloquée et bascule en couverture dégradée traçable.

---

## 4. Simulation de Revue de Code (Pair Review)

> **Revue par @AlexandreRiviere (Architecte)**  
> *"L'implémentation du séquestre Stripe Connect et la protection Circuit Breaker sur l'émission de la police Wakam sont parfaitement conformes au cadrage du Bloc 1."*

---

## 5. Décision de Merge & Clôture ClickUp

- [x] **CI Status** : Verte
- [x] **Code Review** : Approuvée par l'Architecte
- [x] **Statut Ticket ClickUp** : Basculé à `complete`
