# OGame Command Center (OGCC)

Extension Chrome (Manifest V3) qui ajoute une couche moderne au-dessus d'OGame :
refonte visuelle optionnelle, tableau de bord de l'empire, historique, planification,
analyse des expéditions et aide à la décision.

- **Aucune automatisation du gameplay** : OGCC observe, calcule et affiche. Voir [docs/compliance.md](docs/compliance.md).
- **Données 100 % locales** : pas de serveur, pas de compte, pas de télémétrie.
- **Compatible OGLight** : interface isolée dans un Shadow DOM, tout est préfixé `ogcc`.

## Installation (développement)

Prérequis : Node.js 22+, Chrome/Chromium 120+.

```bash
npm install
npm run build        # ou: npm run dev (rebuild automatique)
```

Puis dans Chrome : `chrome://extensions` → activer le **mode développeur** →
**Charger l'extension non empaquetée** → choisir le dossier `dist/`.

Après un rebuild, cliquer sur ↻ dans `chrome://extensions` puis recharger l'onglet OGame.

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | Build en mode watch (sourcemaps inline, non minifié) |
| `npm run build` | Typecheck + build de production dans `dist/` |
| `npm run typecheck` | TypeScript strict (code + configs) |
| `npm run lint` | ESLint (typescript-eslint strict, règles hooks, interdits OGCC) |
| `npm test` | Tests unitaires Vitest |
| `npm run check` | Tout : typecheck, lint, tests, build |

## Ce que fait la version actuelle (Phase 0)

- Reconnaît les pages de jeu `https://sXXX-yy.ogame.gameforge.com/game/…`.
- Affiche en bas à gauche un petit lanceur **« OGCC est actif »** ; il ouvre un panneau avec
  l'état (page détectée, univers, stockage) et les paramètres.
- Paramètres également accessibles depuis l'icône de l'extension (popup), qui sert aussi de
  filet de sécurité pour désactiver l'interface moderne.
- Le toggle **Interface moderne** est fonctionnel mais ne modifie pas encore OGame
  (il pose seulement le marqueur `data-ogcc-theme="modern"` sur `<html>`).

## Architecture

Séparation stricte : adapter OGame → domaine → stockage → analytics → UI.
Détails : [docs/architecture.md](docs/architecture.md).

| Doc | Contenu |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Règles permanentes pour les agents IA (lu aussi via `CLAUDE.md`) |
| [docs/architecture.md](docs/architecture.md) | Couches, contextes d'exécution, build, choix techniques |
| [docs/ogame-dom.md](docs/ogame-dom.md) | Ce que l'on sait (vérifié ou non) du DOM et des URLs OGame |
| [docs/storage.md](docs/storage.md) | Préférences, IndexedDB, migrations |
| [docs/design-system.md](docs/design-system.md) | Tokens, typographie, composants, isolation CSS |
| [docs/compliance.md](docs/compliance.md) | Ce qu'OGCC s'interdit de faire |

## Roadmap

0. **Fondations** ✅
1. Modernisation de la vue d'ensemble (Overview), à partir du DOM réel
2. Navigation, planètes, ressources
3. Command Center
4. Snapshots de l'empire et progression
5. Planificateur
6. Analyse des expéditions
7. Conseiller planétaire
8. Modernisation progressive des autres pages
