# The Family Ledger

A reusable React app for monthly family money meetings.

## View locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Vite hot-reloads as you edit files.

To preview the GitHub Pages build locally:

```bash
npm run build
npm run preview
```

Then open [http://localhost:4173/family-ledger/](http://localhost:4173/family-ledger/).

## Deployment

The public sample-data version deploys to GitHub Pages through GitHub Actions.

> Do not commit real financial data while this repository is public.

## Personal data safety

| File | Purpose | Committed? |
|------|---------|------------|
| `src/data/months/YYYY-MM.local.js` | Your real month numbers | **No** — gitignored |
| `src/data/months/YYYY-MM.sample.js` | Rounded demo data for GitHub Pages | Yes |
| Browser `localStorage` (`fl-{monthId}-*`) | Meeting notes & edits | Never in git — stays on your device |

**Why do I still see real numbers in dev?**  
If `src/data/months/2026-07.local.js` exists, it overrides the sample file. You'll see a **Local data** badge in the toolbar.

- **Fake zeros for preview/commit check:** `npm run dev:sample`
- **Your real figures:** `npm run dev` (with a gitignored `*.local.js` file present)

**Before you commit**, run:

```bash
npm run precommit
```

To auto-block local data on every commit (one-time setup):

```bash
chmod +x .githooks/pre-commit scripts/check-no-personal-data.sh
git config core.hooksPath .githooks
```

The pre-commit hook refuses any staged `*.local.js`, `.env`, or sample files that contain exact-cent fields like `totalExact`.
