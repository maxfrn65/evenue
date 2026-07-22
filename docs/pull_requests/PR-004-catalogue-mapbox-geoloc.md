# Pull Request #4: Catalogue Logements & Recherche Géolocalisée Mapbox

**Ticket ClickUp** : [[CU-004] Catalogue Logements & Recherche Géolocalisée Mapbox](https://app.clickup.com/t/86cavk7q0) (ID: `86cavk7q0`)  
**Branche source** : `feature/CU-004-catalogue-mapbox-geoloc`  
**Branche cible** : `main`  
**Assignataire Fictif** : Thomas Moreau (Dev Frontend)  
**Revue par** : Julie Dupuis (UI/UX Designer)  

---

## 1. Contexte & Description des changements

Développement du catalogue de logements et du moteur de recherche géolocalisée d'Evenue (Lot 5 - Frontend SvelteKit & UI) :
- **Service Métier de Recherche** : `src/lib/server/listings.ts` gérant le géo-filtrage par ville, la fourchette de prix, la capacité minimale d'invités, et les types d'événements autorisés (`SOIRÉE`, `ANNIVERSAIRE`, `MARIAGE`, `COCKTAIL`).
- **Endpoints API SvelteKit** :
  - `/api/listings` (GET/POST) pour la recherche dynamique et la création de logements en BDD.
  - `/api/listings/[id]` (GET) pour les détails d'un lieu.
- **Page Catalogue & Carte Géolocalisée** (`/listings`) :
  - Barre de filtres réactive avec widget de recherche.
  - Integration de la carte géolocalisée interactive Mapbox avec marqueurs de prix.
  - Grille de cartes de logements avec badge de garantie Wakam et statut d'hôte vérifié Stripe.
- **Page Détail du Logement** (`/listings/[id]`) :
  - Fiche complète récapitulant les équipements événementiels (système son 2000W, jeux de lumière).
  - Profil de l'hôte vérifié via Stripe Connect.
  - Calculateur du tarif de réservation et séquestre avec bannière de transparence d'assurance Wakam.

---

## 2. Tests effectués & Couverture

- [x] **Vitest Unit Tests** : 13/13 tests au vert (dont 2 tests dédiés à la recherche `listings.test.ts`).
- [x] **Svelte Check & TypeScript** : 0 erreur, 0 avertissement.
- [x] **Production Build** : Build SvelteKit adapter-node validé.

---

## 3. Points de vigilance Sécurité (OWASP) & Accessibilité

- **OWASP A03 (Injection)** : Filtrage dynamique sécurisé via l'ORM Prisma et conversion stricte des paramètres numériques.
- **Accessibilité (a11y)** : Validé 0 avertissement Svelte Check (entités HTML échappées `&lt; 1h`).

---

## 4. Simulation de Revue de Code (Pair Review)

> **Revue par @JulieDupuis (UI/UX Designer)**  
> *"L'ergonomie du catalogue et de la carte Mapbox est excellente. La mise en valeur du badge Wakam rassurerait immédiatement un invité.*  
> **Point d'amélioration réclamé** : S'assurer que le composant de carte réagit bien sans bloquer le défilement mobile sur les petits écrans."

> **Réponse de @ThomasMoreau (Auteur - Dev Frontend)**  
> *"Correction validée : La colonne carte passe en dessous de la grille sur écran mobile (`grid-cols-1 lg:grid-cols-3`) avec un conteneur collant `sticky top-24` actif sur écran desktop."*

---

## 5. Décision de Merge & Clôture ClickUp

- [x] **CI Status** : Verte
- [x] **Code Review** : Approuvée par la Designer UI/UX
- [x] **Statut Ticket ClickUp** : Basculé à `complete`
