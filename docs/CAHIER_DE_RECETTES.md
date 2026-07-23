# Cahier de Recettes — Evenue

**Compétence visée (éliminatoire)** : **C2.3.1** — *Élaborer le cahier de recettes en rédigeant les scénarios de tests et les résultats attendus afin de détecter les anomalies de fonctionnement et les régressions éventuelles.*

**Critères d'évaluation associés** :
- « Le cahier de recettes reprend l'ensemble des fonctionnalités attendues. »
- « Les tests fonctionnels, structurels et de sécurité exécutés sont conformes au plan défini. »

---

## 1. Objet et périmètre

Ce cahier de recettes décrit **l'ensemble des scénarios de tests** permettant de valider la conformité de la plateforme Evenue aux spécifications fonctionnelles, structurelles et de sécurité, avant mise en production.

**Périmètre couvert** : recherche et catalogue, authentification, KYC hôte, gestion des annonces, réservation et séquestre financier, assurance et sinistres, messagerie, tableau de bord, synchronisation iCal, supervision.

---

## 2. Environnement et conditions d'exécution

| Élément | Valeur |
|---|---|
| **Campagne exécutée le** | **23 juillet 2026** |
| Version testée | branche `main` + correctifs sécurité/accessibilité |
| URL de recette | `http://localhost:5174` (serveur de développement Vite) |
| Base de données | PostgreSQL (conteneur `evenue-postgres`, port 5433) — état sain, 6 annonces initiales |
| Jeu de données | Jeu de démonstration `prisma/seed.ts` + comptes créés en campagne |
| Paiement | **Stripe simulé** (identifiants `pi_mock_*`, `acct_mock_*`) — aucun appel à l'API Stripe réelle |
| Assurance | Service Wakam simulé ; Circuit Breaker à l'état `CLOSED` |

**Comptes créés pour la campagne**

| Rôle | Compte | Usage |
|---|---|---|
| Hôte | `recette.guest.<ts>@evenue.test` (promu HOST) | Publication d'annonce, déclaration de sinistre |
| Invité | `recette.guest2.<ts>@evenue.test` | Réservation, contestation de sinistre |

> **Limite de la campagne** : les scénarios impliquant un flux Stripe réel, l'import iCal externe et le mode dégradé de l'assureur n'ont pas pu être exécutés en environnement simulé. Ils sont explicitement marqués ⏳ **non exécutés** — ils ne sont pas présumés conformes.

---

## 3. Conventions

**Niveaux de criticité** : **Bloquant** (empêche la mise en production) · **Majeur** (dégrade une fonction clé) · **Mineur** (confort/cosmétique).

**Statuts** : ✅ Conforme (exécuté) · ❌ Non conforme (exécuté, défaut constaté) · ⏳ Non exécuté.

**Types** : **F** Fonctionnel · **S** Structurel (technique/unitaire) · **SEC** Sécurité.

---

## 4. Tests fonctionnels

### 4.1 Recherche & catalogue

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| F-01 | Afficher le catalogue | Liste des lieux avec titre, ville, capacité, prix | Bloquant | ✅ | HTTP 200, annonces et visuels rendus |
| F-02 | Filtrer par ville | Seules les annonces de la ville ciblée | Majeur | ✅ | `?city=Bordeaux` → 2 annonces |
| F-03 | Filtrer par capacité | Annonces avec `maxCapacity ≥ seuil` | Majeur | ✅ | `?minCapacity=100` → 1 annonce |
| F-04 | Filtrer par dates | Exclusion des lieux réservés/hors plage | Majeur | ⏳ | Non exécuté cette campagne |
| F-05 | Filtrer par type d'événement | Seuls les lieux autorisant ce type | Majeur | ✅ | `?eventType=MARIAGE` → 2 annonces |
| F-06 | Carte géolocalisée | Repères de prix, tuiles chargées | Mineur | ✅ | 4 tuiles CartoDB chargées, conteneur Leaflet actif |
| F-07 | Recherche sans résultat | Message d'absence, sans erreur technique | Mineur | ✅ | HTTP 200, 0 annonce, aucune erreur |

### 4.2 Authentification & comptes

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| F-10 | Créer un compte invité | Compte créé, session ouverte | Bloquant | ✅ | HTTP 201, cookie `evenue_session` `HttpOnly` émis |
| F-11 | Refuser un email déjà utilisé | Erreur explicite, aucun doublon | Majeur | ✅ | HTTP 400 « Un compte avec cette adresse email existe déjà. » |
| F-12 | Refuser un mot de passe trop court | Message « 8 caractères » | Majeur | ✅ | HTTP 400, message conforme |
| F-13 | Se connecter | Session ouverte | Bloquant | ✅ | HTTP 200 |
| F-14 | Rejeter des identifiants invalides | Message générique, HTTP 401 | Bloquant | ✅ | HTTP 401 « Identifiants incorrects. » (pas d'énumération) |
| F-15 | Se déconnecter | Cookie supprimé | Majeur | ✅ | HTTP 200 |

### 4.3 Devenir hôte & KYC

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| F-20 | Passer au statut hôte | Rôle `HOST`, accès création annonce | Majeur | ✅ | Rôle promu ; `/listings/new` passe de 303 à 200 |
| F-21 | Lancer l'onboarding KYC | Lien d'onboarding Stripe généré | Majeur | ❌ | Lien généré mais **URL malformée** (double `?`) et compte **mocké** → **ANO-015** |
| F-22 | Interdire la création d'annonce à un non-hôte | Redirection vers `/become-host` | Majeur | ✅ | HTTP 303 → `/become-host` |

### 4.4 Gestion des annonces (hôte)

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| F-30 | Créer une annonce | Annonce créée et visible | Bloquant | ✅ | HTTP 200, annonce créée et retrouvée au catalogue |
| F-31 | Téléverser des images | Images enregistrées et affichées | Majeur | ⏳ | Non exécuté cette campagne |
| F-32 | Refuser une image > 5 Mo | HTTP 413 | Mineur | ⏳ | Non exécuté (contrôle présent dans le code) |
| F-33 | Modifier sa propre annonce | Modifications persistées | Majeur | ⏳ | Non exécuté cette campagne |
| F-34 | Empêcher la modification par un tiers | Refus explicite | **Bloquant** | ✅ | « Vous n'êtes pas autorisé à modifier cette annonce. » |
| F-35 | Supprimer une annonce sans réservation | Annonce supprimée | Majeur | ⏳ | Non exécuté cette campagne |
| F-36 | Bloquer la suppression avec réservations actives | Erreur explicite | Majeur | ⏳ | Non exécuté cette campagne |

### 4.5 Réservation & séquestre financier

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| F-40 | Réserver un lieu disponible | Réservation créée, ventilation tarifaire | Bloquant | ✅ | HTTP 201 — total 840 €, hôte 756 €, frais 84 €, caution 600 € |
| F-41 | Séquestrer les fonds | `Payout` au statut `HELD_IN_ESCROW` | **Bloquant** | ❌ | **Aucun enregistrement `Payout` créé** ; `stripeEscrowHoldId` à `null` → **ANO-014** |
| F-42 | Refuser un chevauchement de dates | Refus explicite | **Bloquant** | ✅ | HTTP 400 « déjà réservé sur ces dates » |
| F-43 | Refuser des dates invalides | Message « dates invalides » | Majeur | ✅ | HTTP 400 « date de début doit être strictement antérieure » |
| F-44 | Annuler une réservation | Statut `CANCELLED` | Majeur | ✅ | HTTP 200, statut vérifié en base : `CANCELLED` |

### 4.6 Assurance & sinistres

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| F-50 | Émettre une police à la réservation | Police créée et rattachée | Bloquant | ✅ | Police `WAK-2026-29462`, statut `ACTIVE` |
| F-51 | Mode dégradé assureur | N° de police hors-ligne, réservation aboutie | **Bloquant** | ⏳ | Non exécuté e2e (couvert par tests unitaires du Circuit Breaker) |
| F-52 | Télécharger l'attestation | Attestation imprimable | Majeur | ✅ | HTTP 200 pour une partie prenante |
| F-53 | Déclarer un sinistre (hôte) | Sinistre enregistré, réservation `DISPUTED` | Majeur | ✅ | Sinistre `SIN-WAK-541709` ; réservation → `DISPUTED`, sinistre → `CLAIMED` |
| F-54 | Interdire la déclaration hors délai | Refus explicite | Majeur | ✅ | « L'événement n'est pas encore terminé… » |
| F-55 | Contester un sinistre (invité) | Contestation enregistrée | Majeur | ✅ | HTTP 200 ; `ClaimHistory` alimenté (2 entrées) |
| F-56 | Cloisonner les rôles sur le sinistre | Refus dans les deux sens | **Bloquant** | ✅ | Invité→déclaration refusée ; hôte→contestation refusée |

### 4.7 Messagerie, tableau de bord & iCal

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| F-60 | Envoyer un message | Message enregistré | Majeur | ✅ | HTTP 200, message persisté |
| F-61 | Compteur de messages non lus | Nombre exact | Mineur | ✅ | `unreadCount: 1` conforme |
| F-62 | Tableau de bord invité | Réservations de l'utilisateur | Majeur | ✅ | HTTP 200 |
| F-63 | Tableau de bord hôte | Sections annonces + bilan | Majeur | ✅ | HTTP 200 |
| F-64 | Exporter le calendrier iCal | Flux `.ics` RFC 5545 | Majeur | ✅ | `BEGIN:VCALENDAR`, `PRODID`, `X-WR-CALNAME` conformes |
| F-65 | Importer un calendrier externe | Dates externes indisponibles | Majeur | ⏳ | Non exécuté (nécessite un flux iCal public) |

---

## 5. Tests structurels (techniques)

Exécutés automatiquement (`npm test`, `npm run test:coverage`, `npm run check`).

| ID | Objectif | Résultat attendu | Statut | Résultat constaté |
|---|---|---|---|---|
| S-01 | Exécution de la suite unitaire | 100 % passants | ✅ | **89 tests / 18 fichiers, 100 % passants** |
| S-02 | Couverture de la couche métier | ≥ 75 % instructions | ✅ | 79,2 % instructions / 82,3 % lignes |
| S-03 | Seuils de couverture bloquants | Build en échec sous les seuils | ✅ | Seuils actifs dans `vite.config.ts` |
| S-04 | Contrôle de typage statique | 0 erreur | ✅ | `svelte-check` : **0 erreur**, 8 avertissements préexistants |
| S-05 | Moteur Circuit Breaker | Transitions conformes | ✅ | Couvert par `circuit-breaker.test.ts` |
| S-06 | Détection de chevauchement | Rejet des conflits | ✅ | Vérifié unitairement et en recette (F-42) |
| S-07 | Intégration continue | Pipeline complet | ✅ | lint → tests → audit SCA → build → déploiement |
| S-08 | Supervision | `/api/health` et `/api/metrics` | ✅ | HTTP 200 ; base `HEALTHY`, Circuit Breaker `CLOSED` |

## 6. Tests de sécurité

| ID | Objectif | Résultat attendu | Criticité | Statut | Résultat constaté |
|---|---|---|---|---|---|
| SEC-01 | Anti-SSRF (métadonnées cloud) | Refus, aucune requête sortante | **Bloquant** | ✅ | HTTP 400 « Adresse IP privée ou de bouclage interdite. » |
| SEC-02 | Rejet des IP privées | Refus systématique | **Bloquant** | ✅ | Couvert unitairement (10/8, 172.16/12, 192.168/16, 127/8, `::1`) |
| SEC-03 | Rejet des schémas non http(s) | Refus | Majeur | ✅ | `file:///etc/passwd` → HTTP 400 |
| SEC-04 | Anti-brute-force connexion | HTTP 429 + `Retry-After` | Majeur | ✅ | 429 déclenché au 10ᵉ essai, `Retry-After: 79` |
| SEC-05 | Limitation des inscriptions | HTTP 429 | Mineur | ⏳ | Non exécuté (même mécanisme que SEC-04) |
| SEC-06 | En-têtes de sécurité | CSP, XFO, nosniff, Referrer, Permissions | Majeur | ✅ | Tous présents ; aucune violation CSP au navigateur |
| SEC-07 | Cookie de session durci | `HttpOnly`, `SameSite`, `Secure` en prod | Majeur | ✅ | `HttpOnly` confirmé sur cookie émis |
| SEC-08 | Hachage des mots de passe | Aucun mot de passe en clair | **Bloquant** | ✅ | Empreintes uniquement ; 0 occurrence en clair en base |
| SEC-09 | Absence de secret dans le code | Aucun secret codé en dur | **Bloquant** | ✅ | Secrets lus via `$env/dynamic/private` |
| SEC-10 | Contrôle d'accès horizontal | Refus sur ressource d'autrui | **Bloquant** | ✅ | Annonce (modif/suppr) et attestation : refus confirmés |
| SEC-11 | Accès non authentifié aux API | HTTP 401 | Majeur | ✅ | `/api/messages`, `/api/claims`, `/api/upload`, `/api/stripe/connect` → 401 |
| SEC-12 | Audit des dépendances | Aucune vulnérabilité critique | Majeur | ✅ | 0 critique (3 « élevées » suivies sous ANO-012) |
| SEC-13 | Réservation non authentifiée | HTTP 401 | **Bloquant** | ✅ | **Défaut détecté puis corrigé** (ANO-013) ; 401 après correctif |
| SEC-14 | Fuite d'information technique | Pas d'erreur interne exposée | Majeur | ❌ | Erreur **Prisma brute** renvoyée au client → **ANO-016** |

## 7. Tests d'accessibilité (RGAA 4.1)

| ID | Objectif | Statut | Résultat constaté |
|---|---|---|---|
| A11Y-01 | Langue de la page | ✅ | `<html lang="fr">` |
| A11Y-02 | Lien d'évitement | ✅ | Skip-link présent, cible `#main` |
| A11Y-03 | Étiquetage des champs | ✅ | Libellés associés sur les formulaires audités |
| A11Y-04 | Restitution des erreurs | ✅ | `role="alert"` + `aria-live` sur connexion/inscription |
| A11Y-05 | Navigation au clavier | ✅ | Focus visible sur les éléments interactifs |
| A11Y-06 | Alternatives textuelles | ✅ | `alt` présents ; carte dotée d'un nom accessible |
| A11Y-07 | Réduction des animations | ✅ | `prefers-reduced-motion` pris en charge |
| A11Y-08 | Contraste des textes | ⏳ | Vérification outillée non réalisée (cf. plan d'action RGAA) |

---

## 8. Synthèse de recette

| Catégorie | Scénarios | ✅ Conformes | ❌ Non conformes | ⏳ Non exécutés |
|---|---|---|---|---|
| Fonctionnels | 38 | 28 | 2 | 8 |
| Structurels | 8 | 8 | 0 | 0 |
| Sécurité | 14 | 12 | 1 | 1 |
| Accessibilité | 8 | 7 | 0 | 1 |
| **Total** | **68** | **55** | **3** | **10** |

### Défauts constatés

| Anomalie | Scénario | Criticité | État |
|---|---|---|---|
| **ANO-013** — Réservation créable sans authentification | SEC-13 | **Bloquant** | ✅ **Corrigé et couvert par 4 tests de non-régression** |
| **ANO-014** — Entité `Payout` jamais alimentée (suivi du séquestre) | F-41 | **Bloquant** | ⚠️ Ouvert |
| **ANO-015** — URL d'onboarding Stripe malformée | F-21 | Mineur | ⚠️ Ouvert |
| **ANO-016** — Erreur Prisma brute exposée au client | SEC-14 | Majeur | ⚠️ Ouvert |

### Conclusion de recette

La campagne a permis de détecter **4 anomalies dont 2 bloquantes**, ce qui valide l'utilité du dispositif de recette. La faille d'authentification sur la réservation (**ANO-013**) a été **corrigée et verrouillée par des tests de non-régression** dès sa détection.

**Deux réserves subsistent avant mise en production** : le suivi du séquestre en base (**ANO-014**) et l'exposition d'erreurs techniques (**ANO-016**). Dix scénarios restent à exécuter dans un environnement disposant d'un Stripe de test réel et de flux iCal externes.

---

## 9. Traçabilité des anomalies

Toute anomalie détectée en recette est consignée puis traitée selon le processus décrit dans `docs/PLAN_CORRECTION_BOGUES.md` (qualification, criticité, correctif, test de non-régression).
