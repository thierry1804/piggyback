# Piggyback

Free web app to track your savings goals. Create goals, add or withdraw funds, and visualize your progress. 100% private: data stays on your device (optional cloud sync).

## Features

- **Savings goals**: name, target amount, icon, color, currency, optional deadline
- **Deposits and withdrawals**: quick add from a card or from a goal’s detail page
- **Dashboard**: total saved, overall progress, list of goals
- **Goal detail**: evolution chart, transaction history, savings tips
- **Settings**: currency (code + symbol), language (French, English, Malagasy)
- **Tutorial**: guided page with interactive mockups and step-by-step navigation
- **Cloud sync** (optional): Supabase connection to access your data across devices
- **Offline mode**: Service Worker, data in localStorage
- **Multilingual**: French, English, Malagasy

## Prerequisites

- **Node.js** 18+ and npm

## Installation and run

```bash
# Clone the repo (or open the project)
cd piggyback

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app is available at **http://localhost:5173/** (or another port if 5173 is in use).

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Vite dev server          |
| `npm run build`   | Production build         |
| `npm run preview` | Preview the build        |
| `npm run check`   | TypeScript check         |

## Project structure

```
piggyback/
├── client/                 # React frontend (Vite root)
│   ├── public/             # Static assets (SW, manifest, icons)
│   └── src/
│       ├── components/     # Reusable components and UI (shadcn)
│       ├── contexts/       # SyncContext
│       ├── hooks/          # use-goals, use-settings, use-language, etc.
│       ├── lib/            # localStorage, i18n, supabase, basePath
│       └── pages/          # Landing, Tutorial, Dashboard, GoalDetails, Settings
├── shared/                 # Shared schemas and types
│   ├── schema.ts
│   └── routes.ts
├── deploy/                 # Deployment config (Apache)
├── supabase/               # Supabase migrations (optional sync)
├── vite.config.ts
├── package.json
└── README.md
```

## Tech stack

- **Build**: Vite 7, React 18, TypeScript
- **Routing**: Wouter
- **Server state / cache**: TanStack React Query
- **UI**: Tailwind CSS, Radix UI (shadcn), Framer Motion, Lucide React
- **Forms**: react-hook-form, Zod
- **Data**: localStorage (primary), Supabase (optional)
- **i18n**: translation file (fr, en, mg) in `client/src/lib/i18n.ts`

## Optional cloud sync

To enable Supabase sync:

1. Create a project on [Supabase](https://supabase.com).
2. Create a `.env` file at the project root:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Run migrations in `supabase/migrations/` if needed.

Without these variables, the app runs entirely locally (localStorage).

## Deployment

- **Build**: `npm run build` → output in `dist/`.
- **Base path**: the build uses `base: "./"`; it can be served at the root (`/`) or in a subfolder (e.g. `/piggyback/`). Base path is detected automatically on load.
- **Apache**: see `deploy/README.md` and `deploy/apache-piggyback.conf` for SPA config (fallback to `index.html`).

## License

MIT.
