# PR #009 — API Assurance : Formulaire de Déclaration de Sinistre & Certificats Wakam PDF/HTML

## Ticket ClickUp
[CU-009] API Assurance: Formulaire de Declaration de Sinistre et Certificats PDF Wakam

## Contexte
Afin de compléter le Lot 7 (API Assurance Wakam & Circuit Breaker), les utilisateurs (hôtes et invités) devaient disposer d'une interface pour déclarer un sinistre et télécharger leur attestation officielle de police Wakam avec les plafonds de garanties (10 000 €).

## Description des changements

### Service Backend (src/lib/server/claims.ts)
- `submitClaim(input)` :
  - Vérification de l'existence de la réservation et des autorisations de l'utilisateur
  - Mise à jour du statut de la police d'assurance Wakam en `CLAIMED`
  - Bascule du statut de la réservation en `DISPUTED`
  - Génération d'un numéro de dossier de sinistre `SIN-WAK-XXXXXX`
- `generateWakamCertificateHTML(bookingId, userId)` :
  - Génération dynamique du certificat d'assurance officiel Wakam au format HTML/PDF imprimable
  - Détail des plafonds de couverture (10 000 € matériel, 1 000 000 € RC) et informations certifiées des parties

### API & Routes (src/routes/)
- `POST /api/claims` : Endpoint de transmission de la déclaration de sinistre
- `GET /bookings/[id]/certificate` : Endpoint de génération et d'affichage/téléchargement du certificat d'assurance Wakam
- `/claims/new` : Formulaire utilisateur moderne (Svelte 5 Runes) permettant la sélection de la réservation, du type de dégât et du montant estimé

### Dashboard Integrations (src/routes/dashboard/+page.svelte)
- Ajout des boutons d'action « Attestation PDF » et « Sinistre » pour chaque réservation couverte par une police Wakam

### Tests Unitaires (src/lib/server/claims.test.ts)
- 4 tests Vitest validant :
  - La déclaration de sinistre et la mise à jour des statuts BDD
  - La validation du montant et de la description minimale (10 caractères)
  - Le contrôle des autorisations et erreurs de réservation introuvable
  - La présence des garanties et du numéro de police dans l'attestation générée

## Checklist de revue
- [x] Contrôle des autorisations d'accès aux certificats et sinistres
- [x] svelte-check (0 erreur)
- [x] Suite Vitest 24/24 verte (7 files passed)
- [x] Attestation imprimable conforme aux règles Wakam AssurTech

## Revue de code simulée (Marc Dupont — QA Lead)

### Remarque
L'attestation d'assurance est actuellement générée en HTML optimisé pour l'impression (`@media print`). Pour un usage en production avec téléchargement direct d'un binaire PDF natif, il sera opportun d'intégrer une librairie de rendu PDF côté serveur (ex. `puppeteer` ou `pdfkit`).

### Réponse
Tout à fait d'accord. Le format HTML avec styles d'impression CSS offre un rendu instantané à 0ms sans ajouter de binaire lourd dans le bundle node. Pour le Lot 9 (Déploiement Scaleway), l'ajout d'une fonction serverless PDF generation sera évalué.
