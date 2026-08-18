# Source du dossier Bloc 4 (MCO)

Source HTML/CSS du dossier « Maintien de l'application logicielle en condition
opérationnelle », versionnée pour que le PDF soit **régénérable** — le document ne dépend
plus d'un fichier isolé dans un dossier de téléchargements.

| Fichier      | Rôle                                                       |
| ------------ | ---------------------------------------------------------- |
| `cover.html` | Page de garde (sans pied de page)                          |
| `body.html`  | Corps du dossier, §1 à §10                                 |
| `styles.css` | Mise en forme (format A4, titres, tableaux, encadrés)      |
| `build.mjs`  | Rendu PDF via le Chrome installé (Puppeteer en mode `core`) |

## Régénérer le PDF

```bash
cd docs/dossiers && npm install puppeteer-core && node build.mjs
```

Puis assembler la page de garde et le corps (la première page de `body.pdf` est une page
blanche technique : elle décale la numérotation pour que le contenu démarre à « 2 / N ») :

```bash
python3 -c "from pypdf import PdfReader, PdfWriter; w=PdfWriter(); w.add_page(PdfReader('cover.pdf').pages[0]); [w.add_page(p) for p in PdfReader('body.pdf').pages[1:]]; w.write(open('Evenue_Bloc4_MCO.pdf','wb'))"
```

## Cohérence avec le code

Trois affirmations du dossier sont directement vérifiables dans le dépôt et doivent être
mises à jour ensemble :

- le **nombre de tests** et les **taux de couverture** (§2.3, §5, §6.4) — `npm run test:coverage` ;
- la **description des sondes** (§3.3) — `docs/GRAFANA_MONITORING.md` et
  `src/lib/server/metrics.ts` ;
- le **journal des versions** (§7.2) — `CHANGELOG.md`.
