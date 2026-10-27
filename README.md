# Traker — The Daily Page

A digital recreation of Benjamin Franklin's 1726 daily schedule. Plan the day in six time blocks, drag intentions into the hours that will hold them, and close the page with an evening examination.

Live on the web as a single-page React app, styled as an 18th-century parchment journal.

## Features

- **The Scheme of the Hours** — Set the hour you rise and the hour you rest. The page shows how many hours of waking endeavour and repose that leaves, and can reset to Franklin's original 5:00 AM – 10:00 PM scheme.
- **The Daily Page** — Five canonical blocks built from Franklin's schedule, each with a duration of 2, 3, or 4 hours. Slots are generated from your rise hour, so the timeline follows your own day.
- **Tasks and dragging** — Add tasks to a block, reorder blocks by drag and drop, and move items from the scratchpad into any hour slot.
- **Daily Intentions scratchpad** — A holding area for unfiled tasks. Drag a card onto a block, or use the slot selector.
- **Morning resolve and evening examination** — Written entries at the top and bottom of the page.
- **Daily rotation** — A Franklin saying is chosen for each day of the year. Entries are stored per date.
- **Accounts with Clerk** — Sign up or continue as a guest. Signed-in entries are stored per user; guests keep local data.
- **Parchment theme** — Serif typefaces (EB Garamond, IM Fell English, Caveat), aged paper surfaces, and a matching Clerk component theme.
- **Responsive layout** — Single-column chronological flow on small screens, with touch-friendly slotting.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 |
| Build | Vite 6 |
| Auth | Clerk (`@clerk/react`) |
| Persistence | `localStorage` (per user and per day) |
| Styling | Plain CSS (`src/index.css`) |

No backend database is used. The optional `server.js` is a small static file server for serving the built output.

## Getting started

Requirements: Node.js 18 or newer and npm.

```bash
npm install
```

Create `.env.local` in the project root and add your Clerk publishable key:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Get a key from the [Clerk dashboard](https://dashboard.clerk.com). The app throws on startup if the variable is missing.

Start the development server:

```bash
npm run dev
```

Vite serves on `http://localhost:3000` and listens on all interfaces.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload on port 3000 |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the built bundle locally with Vite |

## Project structure

```
.
├── index.html          # HTML shell, fonts, mount point
├── vite.config.js      # Vite config (React plugin, port 3000)
├── server.js           # Minimal static file server for dist/ (port 8080)
└── src
    ├── main.jsx        # Entry point, ClerkProvider setup
    ├── App.jsx         # Scheme page, daily page, blocks, drag and drop, storage
    ├── clerkTheme.js   # Parchment appearance for Clerk components
    └── index.css       # Full stylesheet
```

## How data is stored

Each page saves to `localStorage` under a key that includes the current date:

- Guest: `franklin_six_blocks_v3_YYYY-MM-DD`
- Signed in: `franklin_user_<userId>_YYYY-MM-DD`

The saved payload contains the morning resolve, evening examination, scratchpad items, blocks and their tasks, and the chosen rise and rest hours. State is written on change, so entries survive a reload. Clearing site data removes guest entries.

## Deployment

Build the app, then serve `dist/` with any static host:

```bash
npm run build
```

`server.js` can serve the static files locally on port 8080:

```bash
node server.js
```

Set `VITE_CLERK_PUBLISHABLE_KEY` in the hosting environment. Clerk also needs the production domain allowed in its dashboard.

## Notes

- `dist/`, `node_modules/`, and log files are ignored by Git.
- `.env*.local` is ignored. Never commit real Clerk keys.
- The app is a single page; navigation between the scheme and the daily page is state-driven, not routed.
