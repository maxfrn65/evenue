# Plan de Correction des Bogues

**Compétence visée** : **C2.3.2** — *Élaborer un plan de correction des bogues à partir de l'analyse des anomalies et des régressions détectées au cours de la recette afin de garantir le fonctionnement du logiciel conformément à l'attendu.*

**Critères d'évaluation associés** : les bogues sont détectés, qualifiés et traités ; une analyse des points d'amélioration est réalisée pour chaque test en échec ; les corrections proposées garantissent le bon fonctionnement du logiciel.

---

## 1. Processus de traitement des anomalies

```
Détection → Consignation → Qualification → Priorisation → Correction → Test de non-régression → Clôture
```

| Étape | Description | Outil |
|---|---|---|
| **Détection** | Recette manuelle, suite de tests automatisée, audit de sécurité/accessibilité, journaux de production | Vitest, `npm audit`, logs JSON, `/api/metrics` |
| **Consignation** | Création d'un ticket : contexte, étapes de reproduction, comportement observé vs attendu, criticité | ClickUp |
| **Qualification** | Analyse de la cause racine, identification du module impacté | Revue de code |
| **Priorisation** | Bloquant → correction immédiate · Majeur → avant livraison · Mineur → backlog | ClickUp |
| **Correction** | Correctif sur branche dédiée, revue par un pair | Git / Pull Request |
| **Non-régression** | Ajout d'un test automatisé reproduisant l'anomalie, puis exécution complète de la suite | Vitest + CI |
| **Clôture** | Validation en recette, fusion sur `main`, déploiement | GitHub Actions |

**Règle de non-régression** : *toute anomalie corrigée doit être accompagnée d'un test automatisé qui échouait avant le correctif et passe après.* Les seuils de couverture configurés dans `vite.config.ts` empêchent une régression silencieuse de la couverture.

---

## 2. Grille de criticité

| Niveau | Définition | Délai de traitement |
|---|---|---|
| **Bloquant** | Empêche l'utilisation d'une fonction essentielle, perte/corruption de données, faille de sécurité exploitable | Immédiat, bloque la livraison |
| **Majeur** | Dégrade une fonction clé sans contournement acceptable | Avant la livraison |
| **Mineur** | Gêne limitée, contournement possible, cosmétique | Backlog planifié |

---

## 3. Registre des anomalies détectées et traitées

### ANO-001 — SSRF via l'URL de synchronisation iCal

| Champ | Valeur |
|---|---|
| **Détection** | Audit de sécurité (OWASP A10) |
| **Criticité** | **Bloquant** (faille de sécurité) |
| **Description** | `fetchAndParseExternalICal()` exécutait une requête serveur vers une URL entièrement contrôlée par l'hôte (`icalSyncUrl`), sans validation. Un attaquant pouvait cibler `localhost`, des plages IP privées ou l'endpoint de métadonnées cloud `169.254.169.254`. |
| **Analyse (cause racine)** | Absence de validation de l'entrée utilisateur avant un appel réseau sortant côté serveur. |
| **Correctif** | Création du module `src/lib/server/url-safety.ts` : allowlist de schémas `http`/`https`, déni des hôtes de bouclage, plages privées RFC 1918, CGNAT, link-local (dont IPv6 mappé) et des identifiants embarqués. Validation appliquée **en double barrière** : à la saisie (`createListing`/`updateListing`) et au moment du fetch. |
| **Non-régression** | `url-safety.test.ts` (11 cas) + 2 tests d'intégration dans `listings.test.ts` |
| **Statut** | ✅ Corrigé |

### ANO-002 — Secret de base de données codé en dur dans les sources

| Champ | Valeur |
|---|---|
| **Détection** | Audit de sécurité (OWASP A02) |
| **Criticité** | **Bloquant** (fuite de secret) |
| **Description** | `src/lib/server/db.ts` contenait une chaîne de connexion PostgreSQL Neon **incluant le mot de passe en clair**, utilisée comme valeur de repli. |
| **Analyse (cause racine)** | Le repli avait été introduit parce que `process.env.DATABASE_URL` n'est **pas alimenté depuis `.env`** par Vite dans le runtime SSR : l'application ne démarrait pas sans lui. Le contournement a créé la fuite. |
| **Correctif** | Lecture du secret via `$env/dynamic/private` (mécanisme SvelteKit qui fusionne `.env` et l'environnement), suppression totale du repli, échec explicite au démarrage si le secret est absent. |
| **Action complémentaire requise** | ⚠️ Le secret ayant été exposé dans l'historique Git, il **doit être révoqué et régénéré** côté fournisseur. |
| **Non-régression** | Démarrage applicatif vérifié (HTTP 200 sur `/`, `/listings`, `/api/health`) |
| **Statut** | ✅ Corrigé (rotation du secret à réaliser) |

### ANO-003 — Absence d'en-têtes de sécurité HTTP

| Champ | Valeur |
|---|---|
| **Détection** | Audit de sécurité (OWASP A05) |
| **Criticité** | Majeur |
| **Description** | Aucune en-tête de sécurité n'était émise (pas de CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, HSTS) ; la feuille Leaflet était chargée depuis un CDN tiers sans contrôle d'intégrité. |
| **Analyse** | Configuration de sécurité absente au niveau du middleware HTTP. |
| **Correctif** | Ajout de `applySecurityHeaders()` dans `src/hooks.server.ts` (CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS sur HTTPS) et auto-hébergement du CSS Leaflet via npm. |
| **Non-régression** | Vérification des en-têtes de réponse + contrôle de l'absence de violation CSP au navigateur (polices et tuiles cartographiques fonctionnelles) |
| **Statut** | ✅ Corrigé |

### ANO-004 — Absence de limitation de débit sur l'authentification

| Champ | Valeur |
|---|---|
| **Détection** | Audit de sécurité (OWASP A04/A07) |
| **Criticité** | Majeur |
| **Description** | Les endpoints de connexion, d'inscription et d'upload n'imposaient aucune limitation, autorisant des attaques par force brute et des abus de ressources. |
| **Correctif** | Module `src/lib/server/rate-limit.ts` (fenêtre fixe) appliqué à la connexion (10/5 min), l'inscription (5/15 min) et l'upload (30/10 min), avec réponse `429` et en-tête `Retry-After` ; plafond de 5 Mo par image. |
| **Non-régression** | `rate-limit.test.ts` (6 cas) |
| **Statut** | ✅ Corrigé |

### ANO-005 — Défauts d'accessibilité bloquant la conformité RGAA

| Champ | Valeur |
|---|---|
| **Détection** | Audit d'accessibilité RGAA 4.1 |
| **Criticité** | Majeur |
| **Description** | Langue de page déclarée `en` sur une interface française ; messages d'erreur de formulaire non restitués aux lecteurs d'écran ; `aria-invalid` stylé mais jamais appliqué ; absence de lien d'évitement ; libellés non associés sur le formulaire de contact. |
| **Correctif** | `lang="fr"` ; `role="alert"` + `aria-live` sur les blocs d'erreur ; liaison `aria-invalid`/`aria-describedby` ; skip-link + `id="main"` ; association `for`/`id` ; `fieldset`/`legend` ; respect de `prefers-reduced-motion`. |
| **Non-régression** | `npm run check` — 0 erreur ; contrôle du rendu et de la structure sémantique |
| **Statut** | ✅ Corrigé |

### ANO-006 — Fichier de test factice dans la suite automatisée

| Champ | Valeur |
|---|---|
| **Détection** | Revue de la suite de tests |
| **Criticité** | Mineur |
| **Description** | `src/lib/vitest-examples/greet.spec.ts` (exemple d'échafaudage) gonflait artificiellement le nombre de tests sans couvrir de code métier. |
| **Correctif** | Suppression du dossier d'exemple ; ajout de tests réels sur les nouveaux modules de sécurité. |
| **Statut** | ✅ Corrigé |

### ANO-013 — Création de réservation possible sans authentification

| Champ | Valeur |
|---|---|
| **Détection** | **Campagne de recette fonctionnelle du 23 juillet 2026** (scénario SEC-13) |
| **Criticité** | **Bloquant** (faille de contrôle d'accès, impact financier) |
| **Description** | `POST /api/bookings` comportait un repli « démo » : en l'absence de cookie de session, l'endpoint sélectionnait **le premier utilisateur de rôle `GUEST` trouvé en base** et créait la réservation à son nom. Un appel totalement anonyme a effectivement produit une réservation `CONFIRMED` de 840 € (caution 600 €) attribuée à `guest-alex-01`, avec émission d'une police d'assurance. |
| **Analyse (cause racine)** | Code de commodité destiné à la démonstration, laissé en place sur un endpoint de production ; l'authentification n'était pas traitée comme un prérequis mais comme un cas optionnel. |
| **Correctif** | Suppression totale du repli : l'authentification devient obligatoire, réponse `401` sans session, `guestId` provenant exclusivement du cookie de session. |
| **Non-régression** | `bookings-endpoint.test.ts` — 4 tests, dont deux vérifiant explicitement qu'**aucune réservation n'est créée** sans session. Contrôle e2e : `401` confirmé après correctif. |
| **Statut** | ✅ Corrigé |

### ANO-014 — Suivi du séquestre (`Payout`) jamais alimenté

| Champ | Valeur |
|---|---|
| **Détection** | Campagne de recette du 23 juillet 2026 (scénario F-41) |
| **Criticité** | **Bloquant** (fonction cœur du produit non tracée) |
| **Description** | Le modèle `Payout` (avec son statut `HELD_IN_ESCROW`) existe au schéma mais **n'est jamais créé** par `createBooking()`. Aucune référence à `Payout` n'existe dans `src/lib/server/bookings.ts`. Le champ `stripeEscrowHoldId` de `Booking` reste à `null`. |
| **Analyse** | La ventilation financière est bien calculée et stockée sur `Booking` (`hostEarnings`, `platformFee`, `securityDepositAmount`) et un PaymentIntent à capture différée est créé — le séquestre existe donc **mécaniquement** côté Stripe — mais l'entité de suivi du cycle de vie (séquestre → versement → remboursement) n'est pas persistée. |
| **Correctif proposé** | Créer l'enregistrement `Payout` dans la transaction de `createBooking()` (statut initial `HELD_IN_ESCROW`, montants hôte/plateforme/assureur), et renseigner `stripeEscrowHoldId`. Ajouter les tests unitaires correspondants. |
| **Statut** | ⚠️ Ouvert |

### ANO-015 — URL d'onboarding Stripe malformée

| Champ | Valeur |
|---|---|
| **Détection** | Campagne de recette du 23 juillet 2026 (scénario F-21) |
| **Criticité** | Mineur |
| **Description** | L'URL de retour d'onboarding contient deux points d'interrogation : `…/become-host?stripe=success?stripe_onboarding=success_mock`. Le second `?` devrait être un `&`, sinon le paramètre n'est pas interprété comme tel. |
| **Correctif proposé** | Corriger la concaténation des paramètres de requête dans `src/lib/server/stripe.ts`. |
| **Statut** | ⚠️ Ouvert |

### ANO-016 — Exposition d'erreurs techniques internes au client

| Champ | Valeur |
|---|---|
| **Détection** | Campagne de recette du 23 juillet 2026 (scénario SEC-14) |
| **Criticité** | Majeur |
| **Description** | En cas d'échec, plusieurs endpoints renvoient `error.message` brut au client. Un appel malformé à `/api/messages` a retourné une **erreur Prisma complète**, révélant le nom du modèle, la signature de la requête et les champs du schéma (`email`, `AND`, `OR`, `NOT`…). |
| **Analyse** | Divulgation d'information facilitant la cartographie du modèle de données par un attaquant (OWASP A05). Les blocs `catch` relaient l'exception technique au lieu d'un message métier. |
| **Correctif proposé** | Distinguer les erreurs métier (message affichable) des erreurs techniques : journaliser l'exception complète côté serveur via `logger.error()` et renvoyer au client un message générique. |
| **Statut** | ⚠️ Ouvert |

---

## 4. Anomalies ouvertes (backlog)

| ID | Description | Criticité | Action planifiée |
|---|---|---|---|
| ANO-007 | Contrastes de certains textes secondaires non vérifiés formellement (proches du seuil AA 4.5:1) | Mineur | Audit outillé (axe-core) et assombrissement des tokens concernés |
| ANO-008 | Jeton de session = identifiant utilisateur brut (pas de jeton opaque signé) | Majeur | Migration vers un jeton signé HMAC avec invalidation côté serveur |
| ANO-009 | `script-src` de la CSP autorise `'unsafe-inline'` | Mineur | Mise en place d'une CSP à nonce/hash pour les scripts d'hydratation SvelteKit |
| ANO-010 | Actions GitHub épinglées sur des tags mutables | Mineur | Épinglage par SHA de commit + signature d'image (cosign) et SBOM |
| ANO-011 | Marqueurs cartographiques non atteignables au clavier | Mineur | Documenter/renforcer l'alternative en liste navigable |
| ANO-012 | `npm audit` remonte **9 vulnérabilités (6 faibles, 3 élevées)** dans les dépendances transitives — aucune critique | Majeur | Analyser les 3 avis « élevés », appliquer `npm audit fix` puis évaluer les montées de version majeures nécessaires |

---

## 5. Indicateurs de suivi qualité

| Indicateur | Cible | Valeur actuelle |
|---|---|---|
| Tests automatisés passants | 100 % | **89 / 89** ✅ |
| Couverture instructions (couche métier) | ≥ 75 % | **79,2 %** ✅ |
| Couverture lignes | ≥ 78 % | **82,3 %** ✅ |
| Erreurs de typage | 0 | **0** ✅ |
| Anomalies bloquantes ouvertes | 0 | **1** ⚠️ (ANO-014) |
| Vulnérabilités critiques (SCA) | 0 | **0** ✅ |
| Vulnérabilités élevées (SCA) | 0 | 3 ⏳ (cf. ANO-012) |
