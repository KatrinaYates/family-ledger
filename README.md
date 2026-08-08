# The Family Ledger

A reusable React app for monthly family money meetings.

## View locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Vite hot-reloads as you edit files.

To preview the GitHub Pages build locally:

```bash
npm run build
npm run preview
```

## Backends

Family Ledger keeps the repository boundary backend-agnostic:

- `local` (default): sample/local files + browser localStorage.
- `supabase`: authenticated household data stored in Supabase/Postgres.

To use Supabase, copy `.env.example` to `.env.local`, set the project URL and **publishable** key, and set:

```bash
VITE_LEDGER_BACKEND=supabase
```

Then run:

```bash
npm install
npm run dev:supabase
```

The Supabase backend requires sign-in. The first signed-in user automatically creates a `Family Ledger` household and becomes its owner. Database tables use Row Level Security so authenticated users only see households they belong to.

> Never put a Supabase secret/service-role key in Vite, `.env.example`, GitHub, or browser code.

Database schema is tracked in `supabase/migrations/`. Financial records themselves must never be committed.

## Deployment

The public sample-data version deploys to GitHub Pages through GitHub Actions. It continues to use the local/sample backend unless Supabase environment variables and `VITE_LEDGER_BACKEND=supabase` are deliberately configured for the build.

> Do not commit real financial data while this repository is public.

## Personal data safety

| File / store | Purpose | Committed? |
|------|---------|------------|
| `src/data/months/YYYY-MM.local.js` | Local-only real month numbers during transition | **No** — gitignored |
| `src/data/months/YYYY-MM.sample.js` | Rounded demo data for GitHub Pages | Yes |
| Browser `localStorage` (`fl-*`) | Local-backend meeting notes & edits | Never in git |
| Supabase tables | Private production ledger data | Never in git |

**Why do I still see real numbers in local mode?**  
If `src/data/months/2026-07.local.js` exists, it overrides the sample file. You'll see a **Local data** badge in the toolbar.

- **Fake/sample preview:** `npm run dev:sample`
- **Local figures:** `npm run dev` (with a gitignored `*.local.js` file present)
- **Supabase:** `npm run dev:supabase` (with a gitignored `.env.local`)

**Before you commit**, run:

```bash
npm run precommit
```

To auto-block local data on every commit (one-time setup):

```bash
chmod +x .githooks/pre-commit scripts/check-no-personal-data.sh
git config core.hooksPath .githooks
```

The pre-commit hook refuses local financial data files and environment files containing project configuration.
