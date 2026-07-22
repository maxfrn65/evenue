# Pull Request #5: Refacto UX, Composants Shadcn-Svelte, Carte Interactive Leaflet & Périmètre Wakam

**Ticket ClickUp** : [[CU-005] Refacto UX: Formats Recherche, Shadcn-Svelte, Carte Interactive & Scope Wakam](https://app.clickup.com/t/86cavq44n) (ID: `86cavq44n`)  
**Branche source** : `feature/CU-005-refacto-ux-shadcn-map-wakam`  
**Branche cible** : `main`  
**Assignataire Fictif** : Thomas Moreau (Dev Frontend)  
**Revue par** : Julie Dupuis (UI/UX Designer)  

---

## 1. Contexte & Description des changements

Prise en compte des retours UX et refactorisation complète de l'interface (Lot 5 - Frontend SvelteKit & UI) :
- **Composants UI Shadcn-Svelte** : Implémentation du helper `cn` (`src/lib/utils.ts`) et création des composants standardisés shadcn-svelte dans `src/lib/components/ui/` (`Button`, `Card`, `Input`, `Label`, `Badge`, `Select`).
- **Moteur de Recherche Héro (Page d'accueil)** : Correction du formulaire avec redirection dynamique vers `/listings?city=...&date=...&minCapacity=...`.
- **Typage & Formats des Champs** :
  - Autocomplete datalist pour les villes (Paris, Lyon, Marseille, Aix, Bordeaux, Toulouse, Lille, Nice).
  - Champ date (`type="date"` avec date min au jour J).
  - Champs numériques pour le prix max par soirée et la capacité minimale d'invités.
  - Labels explicites au-dessus de chaque champ sur le formulaire du catalogue.
- **Carte Géolocalisée Interactive** : Remplacement de l'espace factice par un véritable composant `InteractiveMap.svelte` basé sur Leaflet et OpenStreetMap avec tuiles sombres, repères de prix personnalisés et popups cliquables.
- **Scope de la Bannière Wakam** : Suppression de l'affichage répétitif sur la home, le catalogue et la fiche produit. Restriction de la bannière `CoverageBanner` au tunnel de réservation uniquement (`/bookings/new`).
- **Liens Logements Dynamiques** : Chaque carte de logement pointe vers sa fiche unique (`/listings/${item.id}`) avec des identifiants et visuels distincts.

---

## 2. Tests effectués & Couverture

- [x] **Vitest Unit Tests** : 13/13 tests validés.
- [x] **Svelte Check & TypeScript** : 0 erreur, 0 avertissement.
- [x] **Production Build** : Build SvelteKit adapter-node réussi en 5.00s.

---

## 3. Points de vigilance Sécurité (OWASP) & Accessibilité

- **Accessibilité (a11y)** : Balises `<label>` explicites associées à tous les contrôles de formulaire pour les lecteurs d'écran.
- **Transparence Tunnel** : La bannière d'assurance Wakam apparaît exactement au moment où l'utilisateur s'engage dans la réservation.

---

## 4. Simulation de Revue de Code (Pair Review)

> **Revue par @JulieDupuis (UI/UX Designer)**  
> *"La migration vers les composants shadcn-svelte et l'intégration de la carte Leaflet changent radicalement l'expérience utilisateur. Les labels explicites apportent la lisibilité requise.*  
> **Point d'amélioration réclamé** : Confirmer que la carte interactive se charge sans bloquer le rendu serveur SSR."

> **Réponse de @ThomasMoreau (Auteur - Dev Frontend)**  
> *"Confirmation : Le module Leaflet est importé dynamiquement au sein de `onMount` (`await import('leaflet')`), ce qui empêche tout problème d'exécution côté serveur (SSR)."*

---

## 5. Décision de Merge & Clôture ClickUp

- [x] **CI Status** : Verte
- [x] **Code Review** : Approuvée par la Designer UI/UX
- [x] **Statut Ticket ClickUp** : Basculé à `complete`
