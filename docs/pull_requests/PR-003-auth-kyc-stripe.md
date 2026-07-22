# Pull Request #3: Service Authentification & KYC Stripe Connect

**Ticket ClickUp** : [[CU-003] Service Authentification & KYC Stripe Connect](https://app.clickup.com/t/86cavk2c8) (ID: `86cavk2c8`)  
**Branche source** : `feature/CU-003-auth-kyc-stripe`  
**Branche cible** : `main`  
**Assignataire Fictif** : Sarah Chen (Dev Backend)  
**Revue par** : Alexandre Rivière (Lead Dev / Architecte)  

---

## 1. Contexte & Description des changements

Développement du service d'authentification et de la gestion des rôles pour Evenue (Lot 4 - Auth & KYC) :
- **Sécurité des Mots de Passe** : Implémentation du hashage scrypt natif Node.js avec sel aléatoire (`src/lib/server/auth.ts`).
- **Prisma 7 Driver Adapter** : Configuration de l'adaptateur `PrismaPg` avec `pg.Pool` pour la compatibilité avec PostgreSQL (`src/lib/server/db.ts`).
- **Endpoints d'API Auth SvelteKit** :
  - `/api/auth/register` : Inscription avec attribution du rôle (`GUEST` ou `HOST`) et cookie HTTP-Only.
  - `/api/auth/login` : Connexion avec vérification en temps constant des identifiants (`timingSafeEqual`).
  - `/api/auth/logout` : Supression de session sécurisée.
- **Intégration Stripe Connect Express (KYC)** :
  - Endpoint `/api/stripe/connect` générant les liens d'onboarding Stripe pour la vérification KYC des Hôtes.
  - Création automatique du compte Express Stripe rattaché au `stripeAccountId` en base PostgreSQL.
- **Interfaces Utilisateur (Svelte 5)** :
  - Page de connexion (`/auth/login`) et page d'inscription (`/auth/register`) avec sélecteur de rôle Hôte/Invité.

---

## 2. Tests effectués & Couverture

- [x] **Vitest Unit Tests** : 11/11 tests au vert (dont 4 tests dédiés au service d'authentification `auth.test.ts`).
- [x] **Svelte Check & TypeScript** : 0 erreur, 0 avertissement.
- [x] **Production Build** : Build SvelteKit adapter-node généré sans aucune erreur.

---

## 3. Points de vigilance Sécurité (OWASP) & Accessibilité

- **OWASP A02 (Cryptographic Failures)** : Mots de passe hashés avec scrypt (sel 16 octets, clé 64 octets), aucune information sensible en clair.
- **OWASP A07 (Identification and Authentication Failures)** : Attaque par analyse temporelle prévenue via `timingSafeEqual`, cookies de session paramétrés en `HttpOnly` et `SameSite=Lax`.
- **Délégation KYC (RGPD)** : Les données d'identité officielles (passeports, RIB) sont directement traitées par Stripe Connect Express sans passer par nos serveurs.

---

## 4. Simulation de Revue de Code (Pair Review)

> **Revue par @AlexandreRiviere (Lead Dev / Architecte)**  
> *"Très propre. L'utilisation de scrypt avec timingSafeEqual est exemplaire et respecte les recommandations OWASP. L'ajout de l'adaptateur PrismaPg règle parfaitement la compatibilité Prisma 7.*  
> **Point d'amélioration réclamé** : S'assurer que le champ email est systématiquement converti en minuscules avant la recherche et la création en BDD pour éviter la duplication de comptes liée à la casse (ex: User@Domain.com vs user@domain.com)."

> **Réponse de @SarahChen (Auteure - Dev Backend)**  
> *"Correction apportée : La méthode `registerUser` et `loginUser` appliquent désormais un `.toLowerCase().trim()` systématique sur l'adresse email. Les tests unitaires couvrent également ces scénarios."*

---

## 5. Décision de Merge & Clôture ClickUp

- [x] **CI Status** : Verte (Build + Tests 100% valides)
- [x] **Code Review** : Approuvée par le Lead Dev
- [x] **Statut Ticket ClickUp** : Basculé à `complete`
