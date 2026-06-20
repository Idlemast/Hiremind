# HireMind

Decision-support tool for recruiters — triage candidates automatically against job requirements.

## Stack

- **Next.js 16** (App Router, Server Actions)
- **MikroORM + SQLite** (embedded, no external database)
- **Tailwind CSS 4**
- **pnpm**

## Prerequisites

- Node.js 20+
- pnpm 10+

```bash
npm install -g pnpm
```

## Installation

```bash
pnpm install
```

## Database setup

The app uses a local SQLite file (`hiremind.db`) at the project root. Run these once before starting:

```bash
# Create the schema
pnpm db:init

# Seed with sample data
pnpm db:seed
```

Or run both in one command:

```bash
pnpm db:reset
```

> Run `db:reset` any time you want to wipe and reseed the database.

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to `/dashboard`.

## Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start the production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:init` | Create the SQLite schema (drops existing tables) |
| `pnpm db:seed` | `db:init` + seed sample jobs and candidates |
| `pnpm db:seed:only` | Seed sample data without resetting the schema |
| `pnpm db:reset` | `db:init` + `db:seed` in one step |

## Environment variables

None required. The database path is resolved automatically from the project root.
