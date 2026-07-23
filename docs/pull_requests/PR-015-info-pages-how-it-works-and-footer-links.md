# PR #015 — Pages d'Information, "Comment ça Marche" (Hôte vs Convive) & Résolution des Liens Morts Footer

## Ticket ClickUp
[CU-015] Pages d'Information, "Comment ça Marche" (Hôte vs Convive) & Résolution des Liens Morts Footer — `86caw701j`

## Contexte
Création de l'ensemble des pages d'information manquantes de la plateforme Evenue pour éliminer tout lien 404/mort dans le footer et le menu de navigation. Déploiement de la page interactive `/comment-ca-marche` explicitant le fonctionnement de la plateforme selon le profil (Hôte vs Convive).

## Description des changements

### Nouvelles Routes & Pages SvelteKit
- `/comment-ca-marche` & `/how-it-works` (Redirection 301) : Page interactive avec onglets **Convive / Invité** vs **Hôte / Propriétaire**, détails étape par étape et section FAQ.
- `/cgv-assurance` : Détails des garanties et de la couverture assurance Wakam (10k€ dommages matériels, 1M€ RC, 0€ franchise).
- `/sequestre` : Fonctionnement du séquestre financier bancaire Stripe Connect.
- `/kyc-stripe` : Procédure de vérification d'identité Stripe Connect Express.
- `/securite` : Charte de sécurité, normes OWASP et pattern Circuit Breaker.
- `/become-host` : Landing page de présentation "Devenir Hôte Evenue".
- `/mentions-legales` : Mentions légales et CGU Evenue.
- `/confidentialite` : Politique de confidentialité et respect du RGPD.
- `/contact` : Page de support et formulaire de contact direct.

### Composant UI (`src/lib/components/Footer.svelte`)
- Mise à jour de la grille de liens pour pointer directement vers l'ensemble des nouvelles routes actives.

## Checklist de revue
- [x] Aucun lien mort dans le footer ou le menu de navigation.
- [x] Page `/comment-ca-marche` fonctionnelle et responsive avec bascule d'onglets Convive / Hôte.
- [x] Redirection HTTP 301 de `/how-it-works` vers `/comment-ca-marche`.
- [x] svelte-check (0 erreur).
- [x] Suite Vitest (43/43 tests passés).

## Revue de code simulée (Julie Dupuis — Lead UX/UI & Frontend)

### Remarque
Excellent travail sur le design et l'ergonomie. La structure à onglets de la page "Comment ça marche" clarifie immédiatement les deux propositions de valeur (Hôtes & Convives) avec un rendu très soigné.

### Réponse
Merci Julie ! L'ensemble du footer est à présent 100% fonctionnel et toutes les vérifications Svelte 5 / Vitest sont validées.
