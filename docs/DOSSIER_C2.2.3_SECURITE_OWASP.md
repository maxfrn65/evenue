# Dossier Sécurité — Couverture OWASP Top 10 (2021)

**Compétence visée (éliminatoire)** : **C2.2.3** — *Développer le logiciel en veillant à l'évolutivité et à la sécurisation du code source […] pour garantir une exécution conforme.*
**Critère d'évaluation associé** : « Les mesures prises permettent de couvrir les 10 failles de sécurité principales décrites par l'OWASP. »

Ce document met en correspondance chaque catégorie du **OWASP Top 10 (2021)** avec les mesures **réellement implémentées** dans le code source d'Evenue, preuves à l'appui (`fichier:ligne`).

> Méthodologie « Security by Design » : les protections sont intégrées au niveau du code applicatif (hooks, couche serveur, endpoints) et de la chaîne CI/CD, et non ajoutées a posteriori.

---

## Synthèse

| # | Catégorie OWASP 2021 | Statut | Preuve principale |
|---|---|---|---|
| A01 | Broken Access Control | ✅ Couvert | `hooks.server.ts`, guards de routes, contrôles propriétaire-ressource |
| A02 | Cryptographic Failures | ✅ Couvert | scrypt + `timingSafeEqual`, cookies durcis, secrets hors code |
| A03 | Injection | ✅ Couvert | Prisma paramétré, échappement iCal |
| A04 | Insecure Design | ✅ Couvert | Séquestre à capture différée, Circuit Breaker, rate limiting |
| A05 | Security Misconfiguration | ✅ Couvert | Headers de sécurité + CSP, cookies `secure`, suppression CDN |
| A06 | Vulnerable & Outdated Components | ✅ Couvert | `npm audit` bloquant en CI, lockfile, deps récentes |
| A07 | Identification & Auth Failures | ✅ Couvert | Rate limiting anti-brute-force, messages génériques |
| A08 | Software & Data Integrity Failures | ✅ Couvert | `npm ci`, build multi-stage, images taggées par SHA |
| A09 | Security Logging & Monitoring Failures | ✅ Couvert | Logger JSON structuré, endpoint `/api/metrics`, alertes Circuit Breaker |
| A10 | Server-Side Request Forgery (SSRF) | ✅ Couvert | Validation d'URL iCal (allowlist schéma + déni IP privées) |

---

## A01 — Broken Access Control

**Mesures.**
- **Authentification centralisée** dans le hook serveur : le cookie de session `evenue_session` est résolu en `event.locals.user` pour chaque requête — `src/hooks.server.ts:38-56`.
- **Guards de routes** par redirection systématique : espace connecté (`src/routes/dashboard/+page.server.ts`), création d'annonce réservée aux hôtes (`src/routes/listings/new/+page.server.ts`), édition réservée au propriétaire (`src/routes/listings/[id]/edit/+page.server.ts`).
- **Contrôles « propriétaire de la ressource »** au niveau métier :
  - modification/suppression d'annonce vérifiées contre `hostId` — `src/lib/server/listings.ts:274-277` et `:332-335` (« Vous n'êtes pas autorisé à modifier cette annonce »).
  - déclaration de sinistre réservée à l'hôte, contestation réservée à l'invité, attestation accessible uniquement aux deux parties de la réservation — `src/lib/server/claims.ts`.
- **Endpoints API** protégés : renvoient `401` sans session valide (`src/routes/api/messages/+server.ts`, `api/claims/+server.ts`, `api/upload/+server.ts`, `api/stripe/connect/+server.ts`, `api/bookings/+server.ts`, `api/bookings/cancel/+server.ts`).

> **Défaut détecté en recette et corrigé (ANO-013)** : `POST /api/bookings` comportait un repli « démo » attribuant la réservation au premier compte `GUEST` de la base en l'absence de session — permettant à un appelant **anonyme** de créer une réservation avec séquestre et police d'assurance au nom d'un tiers. Le repli a été supprimé (authentification désormais obligatoire) et la correction est verrouillée par 4 tests de non-régression (`bookings-endpoint.test.ts`). Cet incident est tracé dans `docs/PLAN_CORRECTION_BOGUES.md`.

**Évolution possible** (documentée) : le jeton de session est actuellement l'identifiant utilisateur ; une évolution vers un jeton opaque signé (HMAC) côté serveur est planifiée (voir `DECISION_LOG`).

## A02 — Cryptographic Failures

**Mesures.**
- **Hachage des mots de passe** via **scrypt** avec sel aléatoire de 16 octets et clé dérivée de 64 octets ; vérification en temps constant avec `timingSafeEqual` — `src/lib/server/auth.ts:8-23`.
- **Cookie de session durci** centralisé : `httpOnly`, `sameSite=lax`, et **`secure` activé en production** — `src/lib/server/session.ts` (appliqué dans `api/auth/login`, `api/auth/register`, `api/auth/logout`).
- **Aucun secret en dur dans le code source** : la chaîne de connexion base de données et la clé Stripe sont lues depuis l'environnement runtime SvelteKit (`$env/dynamic/private`), sans valeur de repli codée en dur — `src/lib/server/db.ts:4-16`, `src/lib/server/stripe.ts:4-15`. En production, l'absence de secret provoque un échec explicite au démarrage plutôt qu'un repli silencieux.

> ⚠️ **Action de remédiation historique** : une chaîne de connexion Neon contenant un mot de passe était précédemment codée en dur dans `db.ts`. Elle a été supprimée du code ; ce secret ayant été exposé dans l'historique Git, il **doit être révoqué et régénéré côté fournisseur**.

## A03 — Injection

**Mesures.**
- **ORM Prisma** utilisé pour 100 % des accès données : requêtes **paramétrées** par construction, aucune concaténation SQL. Aucun `$queryRaw`/`$executeRaw`/`Unsafe` dans le code applicatif.
- Les filtres de recherche passent par les opérateurs Prisma typés — `src/lib/server/listings.ts:63-130`.
- **Échappement des retours chariot** lors de la génération iCal (prévention d'injection dans le flux .ics) — `src/lib/server/ical.ts`.

## A04 — Insecure Design

**Mesures.**
- **Séquestre financier à capture différée** : les fonds sont autorisés puis capturés manuellement (`capture_method: 'manual'`), garantissant la protection caution/location — `src/lib/server/stripe.ts`.
- **Circuit Breaker** natif à 3 états (CLOSED/OPEN/HALF_OPEN, seuil de 3 échecs, mode dégradé) protégeant l'appel à l'assureur Wakam — `src/lib/server/circuit-breaker.ts`, `src/lib/server/wakam.ts`.
- **Rate limiting** (fenêtre fixe en mémoire) sur les points sensibles — `src/lib/server/rate-limit.ts` : inscription (5 / 15 min / IP), upload (30 / 10 min / IP).
- **Plafonnement de la taille des fichiers** uploadés à 5 Mo — `src/routes/api/upload/+server.ts`.

## A05 — Security Misconfiguration

**Mesures.** En-têtes de sécurité appliqués à **chaque réponse** dans `src/hooks.server.ts` :
- **Content-Security-Policy** stricte : `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'` ; origines externes explicitement restreintes aux fournisseurs de tuiles cartographiques (CartoDB/OpenStreetMap) et de polices (Google Fonts).
- **X-Content-Type-Options: nosniff**, **X-Frame-Options: DENY**, **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy** (caméra/micro/paiement désactivés), **Cross-Origin-Opener-Policy: same-origin**.
- **HSTS** (`Strict-Transport-Security`) activé sur HTTPS.
- **Suppression d'une dépendance CDN tierce sans SRI** : la feuille de style Leaflet est désormais auto-hébergée via le paquet npm au lieu d'`unpkg.com` — `src/app.html`, `src/lib/components/InteractiveMap.svelte`.
- **Protection CSRF** native SvelteKit (`checkOrigin`) conservée.

> Note sur la CSP : `script-src` inclut `'unsafe-inline'` car SvelteKit injecte un script d'hydratation inline et le projet n'a pas de plomberie nonce/hash configurée ; le durcissement vers une CSP à hash est identifié comme évolution.

## A06 — Vulnerable and Outdated Components

**Mesures.**
- **Job d'audit de dépendances (SCA)** ajouté à la CI : `npm audit --audit-level=high` (rapport) + **gate bloquant sur les vulnérabilités critiques** — `.github/workflows/ci-cd.yml` (job `security-audit`, requis avant le build).
- **Installations déterministes** via `package-lock.json` et `npm ci`.
- Dépendances majeures récentes et épinglées (Prisma 7, SvelteKit 2, Stripe 22).

**État à date** : `npm audit` remonte **0 vulnérabilité critique** (le gate CI passe) et 9 avis de moindre gravité (6 faibles, 3 élevées) sur des dépendances transitives, suivis sous ANO-012 dans `docs/PLAN_CORRECTION_BOGUES.md`.

## A07 — Identification and Authentication Failures

**Mesures.**
- **Anti-brute-force** : rate limiting sur la connexion (10 tentatives / 5 min / IP), réponse `429` avec `Retry-After` — `src/routes/api/auth/login/+server.ts`.
- **Vérification en temps constant** (`timingSafeEqual`) et **message d'erreur générique** « Identifiants incorrects » empêchant l'énumération de comptes — `src/lib/server/auth.ts`.
- **Longueur minimale de mot de passe** (8 caractères) — `src/routes/api/auth/register/+server.ts`.
- **Délégation KYC** à Stripe Connect Express : aucune pièce d'identité stockée en interne — `src/lib/server/stripe.ts`.

## A08 — Software and Data Integrity Failures

**Mesures.**
- **Pipeline CI/CD** contrôlé : lint → tests+couverture → audit SCA → build Docker → push registre Scaleway, images taggées par `github.sha` — `.github/workflows/ci-cd.yml`.
- **Intégrité des dépendances** garantie par `npm ci` (respect strict du lockfile).
- **Build multi-stage** isolant les dépendances de build de l'image runtime — `Dockerfile`.

**Évolutions identifiées** : épinglage des actions GitHub par SHA de commit, signature d'image (cosign) et génération de SBOM.

## A09 — Security Logging and Monitoring Failures

**Mesures.**
- **Logger JSON structuré** (niveaux INFO/WARN/ERROR/ALERT, horodatage, service, environnement) — `src/lib/server/logger.ts`.
- **Journalisation HTTP** de chaque requête avec durée (`x-response-time`) et **capture globale des exceptions** non gérées avec stack — `src/hooks.server.ts`.
- **Alertes critiques** émises sur chaque transition d'état du Circuit Breaker — `src/lib/server/circuit-breaker.ts`.
- **Endpoint `/api/metrics`** exposant l'état base de données, l'état du Circuit Breaker, l'uptime et la mémoire (supervision Grafana/Loki — cf. `docs/GRAFANA_MONITORING.md`).

## A10 — Server-Side Request Forgery (SSRF)

**Contexte.** La synchronisation iCal effectue une requête serveur vers une URL fournie par l'hôte (`icalSyncUrl`), surface SSRF potentielle.

**Mesures.** Module de validation dédié `src/lib/server/url-safety.ts` :
- **Allowlist de schémas** : seuls `http`/`https` acceptés (rejet de `file:`, `ftp:`, `gopher:`…).
- **Déni des hôtes internes** : `localhost`, domaines `.local`/`.localhost`, **boucle locale** (`127.0.0.0/8`, `::1`), **plages privées RFC 1918** (`10/8`, `172.16/12`, `192.168/16`), **CGNAT** (`100.64/10`), et surtout l'**endpoint de métadonnées cloud** `169.254.169.254` (link-local `169.254/16`), y compris sous forme **IPv6 mappée**.
- **Rejet des identifiants embarqués** dans l'URL (`user:pass@`).
- **Défense en profondeur** : validation à la fois à la saisie (`createListing`/`updateListing` — `src/lib/server/listings.ts`) et au moment du fetch (`fetchAndParseExternalICal` — `src/lib/server/ical.ts`).

Couverture testée : `src/lib/server/url-safety.test.ts` (11 cas), plus tests d'intégration SSRF dans `src/lib/server/listings.test.ts`.

---

## Preuve de test

L'ensemble des mécanismes de sécurité testables est couvert par la suite automatisée (**85 tests, 100 % passants**) : `auth.test.ts`, `url-safety.test.ts`, `rate-limit.test.ts`, `session.test.ts`, `circuit-breaker.test.ts`, `claims.test.ts`, `stripe.test.ts`, etc.
