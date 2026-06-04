@AGENTS.md

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

## Fichiers de référence

- `todo.md` (racine du projet) — fonctionnalités restantes à implémenter avec détail technique
- `updates.md` (racine du projet) — journal de bord des sessions de développement
- `wiki/` — documentation produit (vision, concepts, design)

## Conventions de code

- Pas de commentaires sauf si le "pourquoi" est non-évident
- Pas de gestion d'erreur pour des cas impossibles (faire confiance aux garanties du framework)
- Valider uniquement aux frontières système (inputs utilisateur, params URL)
- Préférer les Server Components et Server Actions aux Client Components quand possible
- Les Client Components (`"use client"`) uniquement pour l'interactivité (state, events)
