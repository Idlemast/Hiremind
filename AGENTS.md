# HireMind — Agent & Developer Guide

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 App Router (voir note ci-dessous) |
| Langage | TypeScript strict (`strict: true`) |
| Base de données | SQLite via MikroORM 7 (`EntitySchema`, sans décorateurs) |
| Style | Tailwind CSS 4 + tokens CSS custom |
| Runtime | Node.js, pnpm 10 |

> **ATTENTION — Next.js 16 :** cette version contient des breaking changes par rapport à ce qui est dans les données d'entraînement. Lire les guides dans `node_modules/next/dist/docs/` avant d'écrire du code. En particulier : `searchParams` et `params` sont des `Promise<>` à `await`. `cookies()` et `headers()` sont asynchrones.

---

## Architecture

```
app/
  (app)/          ← groupe de routes protégées (layout commun)
    dashboard/
    jobs/
    candidates/
    stats/
    settings/
  actions/        ← Server Actions ("use server")
  api/            ← Route Handlers (REST)
components/       ← Composants React (Client et Server), organisés par domaine :
  candidates/, jobs/, layout/, settings/, stats/, ui/
entities/         ← Classes MikroORM + EntitySchema
lib/              ← Logique métier pure (triage, thresholds, stats…)
migrations/       ← Migrations MikroORM (init uniquement)
scripts/          ← CLI (seed, db-init)
```

---

## Couche données — règles impératives

### Obtenir un EntityManager

```typescript
import { getEm } from "@/lib/db";
const em = await getEm();
```

- **Toujours** utiliser `getEm()`. Ne jamais importer `getOrm()` directement.
- `getEm()` retourne `orm.em.fork()` — un EM isolé par requête.
- `getOrm()` est wrappé dans `React.cache()` : instance unique par render tree, migrations exécutées à la première invocation.

### Ajouter une colonne

Dans `getOrm()` (`lib/db.ts`), utiliser le helper `addCol()` :

```typescript
await addCol(`ALTER TABLE job ADD COLUMN my_field TEXT NULL`);
```

Ne jamais écrire `try { ... } catch {}` autour d'un ALTER TABLE. `addCol()` ignore silencieusement les erreurs "duplicate column" et logue tout le reste.

### Ajouter un index

Après le `CREATE TABLE IF NOT EXISTS` correspondant dans `getOrm()` :

```typescript
await conn.execute(`CREATE INDEX IF NOT EXISTS idx_my_table_col ON my_table(col)`);
```

---

## Entités — invariants critiques

### Application — pas de champ `fit`

L'entité `Application` **n'a pas de champ `fit`**. Il a été supprimé car il se désynchronisait avec les seuils configurables.

```typescript
// ❌ INTERDIT — fit n'existe pas sur l'entité
const f = application.fit;
em.assign(app, { fit: "strong" });
em.create(Application, { ..., fit: result.fit });

// ✅ CORRECT — toujours calculer depuis score + thresholds
import { scoreToFit } from "@/lib/thresholds";
const thresholds = await getThresholds();
const fit = scoreToFit(application.score, thresholds);
```

### Job — budget et status sont typés, pas de cast

```typescript
// ❌ INTERDIT
const b = (job as any).budget;

// ✅ CORRECT — les propriétés sont sur la classe
const b = job.budget;       // string | undefined
const s = job.status;       // string ("open" | "closed")
```

### Job — `stage` et `progress` sont dérivés, jamais écrits

`Job.stage` et `Job.progress` sont des colonnes orphelines (même cas que `fit` sur `Application`) : elles existent en DB mais ne sont plus tenues à jour. Ne jamais les lire ni les écrire directement.

```typescript
// ❌ INTERDIT — valeurs périmées, plus jamais mises à jour
const label = job.stage;
em.create(Job, { ..., stage: stages[0], progress: 0 });

// ✅ CORRECT — toujours dériver depuis stages + currentStageIndex
import { currentStageName, deriveProgress } from "@/lib/stages";
const label    = currentStageName(job.stages as string[], job.currentStageIndex ?? 0);
const progress = deriveProgress(job.currentStageIndex ?? 0, (job.stages as string[]).length);
```

### Sérialisation Server → Client

Les entités MikroORM ne traversent pas la boundary Server → Client. Convertir en plain objects avant de passer en props :

```typescript
// ✅ Pattern établi dans getTemplates()
return rows.map((t) => ({ id: t.id, name: t.name, ... }));
```

---

## Charger les candidatures d'un poste

```typescript
// ✅ Page /jobs/[id] — charge tout une fois pour JobCandidatesView (liste + kanban)
const apps = await getApplications(jobId);

// ✅ Stats légères (compteurs par fit, stat cards)
const stats = await getApplicationStatsByScore(jobId, thresholds);

// ✅ Toutes les candidatures (advance page, export CSV)
const apps = await getApplications(jobId);

// ✅ Pagination SQL (autres contextes où on n'a pas besoin du kanban)
const { items, total } = await getApplicationsPage(jobId, { q, sort, page, pageSize });
```

La page `/jobs/[id]` utilise `getApplications(jobId)` (toutes les candidatures) car `JobCandidatesView` gère les deux vues côté client. Ne pas revenir à `getApplicationsPage` sur cette page.

---

## Server Actions

Structure type :

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEm } from "@/lib/db";

export async function myAction(formData: FormData) {
  const value = String(formData.get("field") ?? "").trim();
  if (!value) throw new Error("Champ obligatoire");

  const em = await getEm();
  // ... mutations
  await em.flush();

  revalidatePath("/affected-route");
  redirect("/destination");
}
```

- `revalidatePath()` après chaque mutation qui affecte une page.
- Valider les IDs numériques avec `Number.isFinite(id) && id > 0`.
- Ne jamais faire de `fetch()` côté serveur sur une URL fournie par l'utilisateur sans passer par `isSafeUrl()` (`app/api/jobs/preview/route.ts`).

---

## Design system

Classes utilitaires custom (définies dans `globals.css`) :

| Classe | Usage |
|--------|-------|
| `tonal-card` | Card surface principale |
| `text-primary` | Bleu primaire (#00288E) |
| `text-on-surface` | Texte principal |
| `text-on-surface-variant` | Texte secondaire |
| `font-h1` / `text-h1` | Titre niveau 1 (Manrope) |
| `font-h2` / `text-h2` | Titre niveau 2 |
| `font-h3` / `text-h3` | Titre niveau 3 |
| `font-label-caps` / `text-label-caps` | Label capslock (navigation, badges) |
| `p-xl` / `p-lg` / `p-md` / `p-sm` | Espacements |
| `gap-xl` / `gap-lg` / `gap-md` / `gap-sm` | Gaps grille |

Icônes : Material Symbols (`<span className="material-symbols-outlined">icon_name</span>`).

---

## Scoring & triage

- `scoreCandidate(input)` dans `lib/triage.ts` : retourne score 0–100, matchedSkills, missingSkills, why.
- `scoreToFit(score, thresholds?)` dans `lib/thresholds.ts` : retourne `"strong" | "medium" | "weak"`.
- `fitToDecision(fit)` : retourne `"advance" | "review" | "reject"`.
- `analyzeInterviewNotes(notes)` + `notesScoreDelta(analysis)` dans `lib/interview-signals.ts` : ajustement ±15 pts depuis les notes recruteur.
- `buildWhy(score, fit, matched, missing, allSkills)` dans `lib/triage.ts` : génère le texte "The Why".

Lors d'un rescore, toujours recalculer depuis les skills bruts + appliquer le delta des notes :

```typescript
const base    = scoreCandidate({ candidateSkills: skills, jobRequirements: reqs });
const delta   = notesScoreDelta(analyzeInterviewNotes(app.notes ?? ""));
const score   = Math.max(0, Math.min(100, base.score + delta));
const fit     = scoreToFit(score, thresholds);
const why     = buildWhy(score, fit, base.matchedSkills, base.missingSkills, skills);
em.assign(app, { score, gaps: base.missingSkills, why });
```

---

## Patterns à respecter

### Suppression en 2 étapes (pas de modal)

Voir `DeleteJobButton.tsx` — confirmation inline dans le composant, pas de `window.confirm()` ni de `<dialog>`.

### Bouton de copie

Utiliser `<CopyButton text={...} />` (`components/ui/CopyButton.tsx`). Ne pas recréer la logique clipboard inline.

### Recherche URL-first (pages candidats et liste de postes)

Les filtres (`q`, `tag`, `sort`, `page`) vivent dans les search params. La page Server Component lit `searchParams`, filtre côté serveur ou SQL. `SearchBar` avec `keepParams` pour préserver les filtres existants.

**Exception — `/jobs/[id]`** : la section candidats est gérée par `JobCandidatesView` (Client Component). La recherche, le tri, la pagination et le toggle liste/kanban y sont en `useState` — pas de search params pour cette page.

### Pagination

- `PAGE_SIZE = 20` (convention `JobCandidatesView`).
- Sur `/jobs/[id]` : `<button onClick={() => setPage(n)}>` (Client Component).
- Sur les autres pages : `<a href="?page=N">` (Server Component, préserver les autres params).

### Toggle liste/kanban (`/jobs/[id]`)

Le toggle est géré par `JobCandidatesView` via `useState<"list" | "kanban">`. Instantané, sans rechargement. `key={view}` sur le conteneur déclenche `animate-fade-in` à chaque changement.

Ne pas réintroduire `?view=kanban` dans les search params — la page charge toutes les données une fois pour les deux vues.

### KanbanBoard

- `components/jobs/KanbanBoard.tsx` : Client Component, drag-and-drop HTML5 natif.
- Reçoit `stages: string[]` + `initialCards: KanbanCard[]`.
- Mise à jour optimiste : `setCards()` immédiat, Server Action en `useTransition`, rollback sur erreur. **Pas de `router.refresh()`.**
- Limité à 100 cards (top score) — géré dans `JobCandidatesView`, pas dans `KanbanBoard`.
- Cards minimalistes : point de couleur fit + nom + icône lien au survol.

### URLs basées sur un salt (pas l'ID numérique)

`Job` et `Candidate` ont un champ `salt?: string` (10 caractères aléatoires, `lib/slugify.ts#generateSalt()`). Toujours construire les URLs via `jobUrl(salt, title)` / `candidateUrl(salt, name, jobSalt?, jobTitle?)` — jamais `\`/jobs/${job.id}\`` à la main.

Les routes lisent le salt comme le segment avant le premier `-` (`id.split("-")[0]`) puis résolvent via `getJobBySalt()` / `getCandidateBySalt()`. Le reste du segment (slug du titre/nom) est cosmétique, jamais vérifié.

### Fiche candidature — deux points d'entrée, pas une route unique

- `/candidates/[id]` : redirecteur seulement (vers la 1ère Application du candidat, ou état vide si aucune).
- `/jobs/[id]/candidates/[candidateId]` (`CandidateJobProfilePage`) : profil **canonique**, point d'entrée poste-first. Seule version avec `TagEditor` + boutons de suppression + lien candidat↔poste.
- `/candidates/[id]/applications/[appId]` (`ApplicationDetailPage`) : point d'entrée candidat-first (depuis `/candidates` ou le switcher multi-candidatures). Contenu plus restreint (pas de tags, pas de suppression).

Ne pas fusionner ces deux pages ni dupliquer leur logique sans réfléchir — elles servent des points d'entrée différents avec des permissions d'action différentes.

---

## Ce qu'il ne faut pas faire

- ❌ `catch {}` autour d'une opération DB (utiliser `addCol()` ou logger).
- ❌ Charger `getApplications()` sans `jobId` sur une page qui affiche un seul poste.
- ❌ Stocker `fit` sur `Application` (champ supprimé, ne pas le réintroduire).
- ❌ Lire ou écrire `Job.stage` / `Job.progress` directement — dériver via `currentStageName()` / `deriveProgress()` (`lib/stages.ts`).
- ❌ Passer une entité MikroORM directement en prop Client Component.
- ❌ `(entity as any).field` — si le champ n'est pas sur le type, l'ajouter à la classe et au schema.
- ❌ Créer un endpoint API pour une mutation qui peut être une Server Action.
- ❌ `fetch(userProvidedUrl)` côté serveur sans validation via `isSafeUrl()`.
- ❌ Appeler `router.refresh()` dans `KanbanBoard` — la mise à jour optimiste suffit, le refresh cause un rechargement visible.
- ❌ Réintroduire `?view=kanban` dans les search params de `/jobs/[id]` — le toggle est en `useState` dans `JobCandidatesView`.
- ❌ Construire une URL job/candidat à la main avec l'ID numérique — toujours `jobUrl()` / `candidateUrl()` (`lib/slugify.ts`).
- ❌ Réintroduire `.status-ribbon` (bandeau de couleur en bord de card) — banni explicitement par `DESIGN.md` et supprimé de `globals.css`, remplacé par des chips/points de couleur.
