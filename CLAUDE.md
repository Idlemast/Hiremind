@AGENTS.md

## gstack

For all web browsing, use the `/browse` skill from gstack. Never use
`mcp__claude-in-chrome__*` tools directly.

Available gstack skills:
/office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship,
/land-and-deploy, /canary, /benchmark, /browse, /connect-chrome, /qa,
/qa-only, /design-review, /setup-browser-cookies, /setup-deploy,
/setup-gbrain, /retro, /investigate, /document-release, /document-generate,
/codex, /cso, /autoplan, /plan-devex-review, /devex-review, /careful,
/freeze, /guard, /unfreeze, /gstack-upgrade, /learn

## Contexte projet

HireMind est un **System of Clarity** — un outil de triage de candidats qui réduit la fatigue décisionnelle des recruteurs. Il fonctionne en mode standalone (SQLite local, pas d'ATS externe pour le MVP).

L'application tourne en local sur la machine du recruteur. Il n'y a pas encore d'authentification.

## État actuel

- Modèle de données : `Job` → `Application` ← `Candidate` (relation m:n via `Application`)
- Scoring automatique basé sur les compétences (0–100), ajustable via les notes d'entretien
- Pipeline de recrutement configurable par poste (drag-and-drop)
- Templates de postes réutilisables
- Statistiques globales (`/stats`) avec tendance temporelle, gaps fréquents, candidats bloqués
- Export CSV des candidatures
- Comparaison côte-à-côte de deux candidatures (`/jobs/[id]/compare`)
- URLs basées sur un salt aléatoire (non-énumérables) plutôt que sur l'ID numérique

## Fichiers de référence

- `DESIGN.md` / `PRODUCT.md` (racine de l'app) — spec de design system et registre produit/marque vivants ; source de vérité pour le style, à tenir à jour si le système visuel change
- `todo.md` (racine du projet) — fonctionnalités restantes à implémenter avec détail technique
- `updates.md` (racine du projet) — journal de bord des sessions de développement
- `wiki/` — documentation produit (vision, concepts, design)

## Conventions de code

- Pas de commentaires sauf si le "pourquoi" est non-évident
- Pas de gestion d'erreur pour des cas impossibles (faire confiance aux garanties du framework)
- Valider uniquement aux frontières système (inputs utilisateur, params URL)
- Préférer les Server Components et Server Actions aux Client Components quand possible
- Les Client Components (`"use client"`) uniquement pour l'interactivité (state, events)
