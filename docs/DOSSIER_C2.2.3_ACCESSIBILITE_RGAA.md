# Dossier Accessibilité — Conformité RGAA 4.1 (WCAG 2.1 AA)

**Compétence visée (éliminatoire)** : **C2.2.3** — volet accessibilité.
**Critères d'évaluation associés** :
- « Le référentiel d'accessibilité choisi est présenté et justifié. »
- « Le prototype permet de répondre aux exigences du référentiel d'accessibilité préalablement établi. »

---

## 1. Choix et justification du référentiel

**Référentiel de conformité retenu : RGAA 4.1** (Référentiel Général d'Amélioration de l'Accessibilité), complété par la démarche qualité **OPQUAST**.

**Justification.**
- Le **RGAA 4.1** est la **norme légale française** d'accessibilité numérique. Il constitue une **opérationnalisation directe du WCAG 2.1 niveau AA** (standard international du W3C), ce qui en fait la cible la plus pertinente et la plus défendable pour une application web commerciale déployée en France.
- Il fournit une **méthode d'audit auditable** (106 critères de contrôle, tests reproductibles), adaptée à une preuve de certification.
- **OPQUAST** (240 règles qualité web couvrant accessibilité, ergonomie, SEO, performance) est mobilisé **en complément** comme socle de bonnes pratiques transverses. Il ne s'agit pas d'une norme de conformité reconnue : il est cité comme **renfort qualité**, non comme cible de conformité.

**Positionnement de conformité déclaré : *partiellement conforme*** (au sens de l'article RGAA relatif aux déclarations de conformité : totalement / partiellement / non conforme). Cette déclaration honnête s'accompagne d'un relevé des non-conformités résiduelles et d'un plan d'action (§4).

---

## 2. Actions d'accessibilité mises en œuvre

Les mesures suivantes ont été **implémentées dans le code** du prototype.

| Thématique RGAA | Mesure implémentée | Preuve |
|---|---|---|
| 8.3 — Langue de la page | `lang="fr"` déclaré (corrigé depuis `en`) | `src/app.html` |
| 12.7 — Lien d'évitement | Skip-link « Aller au contenu principal » + cible `id="main"` | `src/routes/+layout.svelte` |
| 9.1 — Structuration | Landmarks sémantiques `<header>`/`<nav>`/`<main>`/`<footer>` ; une seule `<h1>` par page | `+layout.svelte`, `Header.svelte`, `Footer.svelte` |
| 11.1 / 11.2 — Étiquetage des champs | Association `<label for>` ↔ `id` sur les formulaires ; formulaire de contact corrigé | `auth/login`, `auth/register`, `contact/+page.svelte` |
| 11.5 — Regroupement de champs | `<fieldset>`/`<legend>` + `aria-pressed` sur le choix de type de compte | `auth/register/+page.svelte` |
| 11.10 — Restitution des erreurs | Messages d'erreur annoncés (`role="alert"` + `aria-live="assertive"`) ; liaison `aria-invalid` + `aria-describedby` | `auth/login`, `auth/register` |
| 1.1 — Images porteuses d'info | `alt` sur 100 % des `<img>` ; alternatives sans le mot « logo » | `Header.svelte`, `Footer.svelte`, galeries |
| 1.1 — Zone non textuelle | Carte Leaflet dotée d'un `role="region"` + nom accessible | `InteractiveMap.svelte` |
| 10.x — Composants | Primitives **shadcn-svelte / bits-ui** : rôles ARIA et gestion du focus natifs | `src/lib/components/ui/**` |
| 10.7 — Prise de focus visible | Anneaux de focus (`focus-visible:ring`) sur les éléments interactifs | primitives UI |
| 13.x / WCAG 2.3.3 — Mouvement | Respect de `prefers-reduced-motion` (réduction des animations) | `src/routes/layout.css` |

**Points forts structurels** (constatés à l'audit) : aucun `<div>`/`<span>` cliquable (usage systématique de `<button>`/`<a>`), hiérarchie de titres respectée, couverture `alt` complète, focus visible géré par le design system.

---

## 3. Grille d'audit synthétique (échantillon de pages)

Pages auditées : accueil, catalogue `/listings`, fiche `/listings/[id]`, connexion, inscription, contact, tableau de bord.

| Thème RGAA | Avant | Après remédiation |
|---|---|---|
| 1. Images | Conforme (alt présents) | Conforme |
| 8. Éléments obligatoires (langue) | **Non conforme** (`lang="en"`) | **Conforme** |
| 9. Structuration (landmarks, titres) | Conforme | Conforme |
| 10. Présentation (focus visible) | Conforme | Conforme |
| 11. Formulaires (labels, erreurs) | **Partiel** (erreurs muettes, labels contact manquants) | **Conforme** |
| 12. Navigation (lien d'évitement) | **Non conforme** (absent) | **Conforme** |
| 3. Couleurs (contrastes) | **Partiel** (textes secondaires `text-slate-400/500`) | **Partiel** (cf. §4) |

---

## 4. Non-conformités résiduelles & plan d'action

| Critère | Non-conformité résiduelle | Action planifiée |
|---|---|---|
| 3.2 — Contraste du texte | Certains textes secondaires (`text-xs` gris `slate-400/500` sur fond blanc) sont proches du seuil AA de 4.5:1 sans vérification formelle | Audit de contraste outillé (ex. axe-core) et assombrissement des tokens de texte secondaire |
| 7.x — Carte interactive | Les marqueurs Leaflet ne sont pas atteignables au clavier | Fournir une **liste alternative** navigable au clavier des lieux (déjà présente sous forme de cartes d'annonces adjacentes) et documenter l'équivalence |
| 12.x — Audit complet | Audit RGAA exhaustif des 106 critères non finalisé | Passage complet de la grille RGAA et publication d'une déclaration de conformité datée |

---

## 5. Vérification effectuée

- **Contrôle statique** : aucune erreur `svelte-check` introduite par les modifications d'accessibilité.
- **Contrôle dynamique** : rendu vérifié sur le serveur de développement (pages accueil/catalogue/connexion), **aucune violation CSP**, polices et carte fonctionnelles, structure sémantique confirmée.
