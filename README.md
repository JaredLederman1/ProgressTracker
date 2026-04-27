# Progress Tracker

A daily habit tracker PWA. Local-first, installable, offline-capable.

**Live:** https://jaredlederman1.github.io/ProgressTracker/

## Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (slate base, dark)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox under the hood)
- [date-fns](https://date-fns.org/), [sonner](https://sonner.emilkowal.ski/) toasts

## Quick start

```bash
npm install
npm run dev
```

Dev server runs on `http://localhost:5173/ProgressTracker/`.

## Build

```bash
npm run build
```

Output is written to `dist/`. The build is configured for the `/ProgressTracker/` base path, so all asset URLs resolve correctly when served from a subdirectory (e.g. GitHub Pages).

## Deploy

Pushes to `main` auto-deploy via GitHub Actions to GitHub Pages. The workflow lives at `.github/workflows/deploy.yml`. First-time setup: in repo **Settings → Pages**, set **Source: GitHub Actions**.

## Install as a PWA

The app is fully installable.

- **iOS / iPadOS (Safari):** open the live URL → tap the **Share** button → **Add to Home Screen**. Launches in standalone mode with the navy theme color.
- **Android (Chrome):** open the live URL → menu → **Install app** (or **Add to Home Screen**). Same standalone behavior.
- **Desktop (Chrome / Edge):** install icon appears in the address bar.

After first load, the service worker caches all assets and the Google Fonts (Inter, JetBrains Mono) for offline use.

> **iOS storage caveat:** localStorage persists for installed PWAs, but iOS may evict it under storage pressure. For long-term safety, use **Settings → Data → Export JSON** periodically and stash the file somewhere stable (iCloud Drive, email).

## Data model

State lives entirely in `localStorage` under the key `tracker.v1`. The shape (typed in `src/types.ts`) is:

```
{
  version: 1,
  habits, adHocTasks, milestones, media: [...],
  entries: { 'YYYY-MM-DD': { date, completedHabits: [...] } }
}
```

There is no remote sync. Backup and restore happen through the **Export JSON** / **Import JSON** buttons in Settings — both round-trip the full state. The importer validates the `version` field before replacing local state.

## Updates

The service worker uses `registerType: 'autoUpdate'`. When a new build is detected, a small toast appears with a **Reload** button to apply the update.
