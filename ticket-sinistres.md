# [Feature] Déclaration & gestion des sinistres

## Description
Après un événement, le **propriétaire** doit pouvoir déclarer un sinistre (dégradations matérielles) sur sa réservation. Cette déclaration gèle les fonds sous séquestre et déclenche le processus assurance. Le **locataire** n'est jamais déclarant, mais il peut documenter, signaler et contester pour ne pas être accusé à tort.

## Rôles
- **Propriétaire** : déclare le sinistre.
- **Locataire** : fait l'état des lieux, peut signaler un incident, peut contester une déclaration.
- **Admin** : arbitre les litiges.
- **Assureur (API)** : instruit le sinistre une fois transmis.

## Flux
1. Fin de l'événement → ouverture d'une **fenêtre de déclaration de 48h** pour le propriétaire.
2. Aucune déclaration → **libération automatique des fonds** (répartition hôte / commission / prime via Stripe).
3. Déclaration du propriétaire → **séquestre gelé**, le locataire est notifié.
4. Le locataire peut **contester** avec ses preuves dans un délai donné.
5. Sans contestation → **transmission à l'assureur**. Avec contestation → **arbitrage admin** puis assureur.
6. Résolution → ventilation des fonds ajustée selon le verdict.

## Critères d'acceptation
- [ ] Le propriétaire ne peut déclarer que pendant la fenêtre de 48h.
- [ ] Une déclaration bloque toute libération de fonds tant que le litige n'est pas résolu.
- [ ] Le locataire peut uploader un état des lieux (entrée/sortie, photos horodatées).
- [ ] Le locataire peut signaler un incident et contester une déclaration avec preuves.
- [ ] Un locataire ne peut pas déclarer de sinistre ; un propriétaire ne peut pas contester (contrôle par rôle).
- [ ] Chaque changement de statut est historisé (qui, quand, ancien/nouveau statut).
- [ ] Libération automatique des fonds via un job planifié si aucun sinistre à l'expiration.

## Hors scope
- Responsabilité civile organisateur (dommages corporels aux participants).

## Technique
Next.js · Node.js · PostgreSQL (transactions ACID) · Stripe Connect (séquestre) · API assureur.
Délais (48h déclaration + contestation) paramétrables, pas en dur.
