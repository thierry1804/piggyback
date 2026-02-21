# Piggyback

Application web gratuite pour suivre vos objectifs d’épargne. Créez des objectifs, déposez ou retirez des fonds, visualisez votre progression. 100 % privée : les données restent sur votre appareil (synchronisation cloud optionnelle).

## Fonctionnalités

- **Objectifs d’épargne** : nom, montant cible, icône, couleur, devise, échéance optionnelle
- **Dépôts et retraits** : ajout rapide depuis une carte ou depuis le détail d’un objectif
- **Tableau de bord** : total épargné, progression globale, liste des objectifs
- **Détail par objectif** : graphique d’évolution, historique des transactions, conseils d’épargne
- **Paramètres** : devise (code + symbole), langue (Français, English, Malagasy)
- **Tutoriel** : page guide avec maquettes interactives et navigation par étapes
- **Synchronisation cloud** (optionnelle) : connexion Supabase pour retrouver vos données sur plusieurs appareils
- **Mode hors ligne** : Service Worker, données en localStorage
- **Multilingue** : français, anglais, malgache

## Prérequis

- **Node.js** 18+ et npm

## Installation et lancement

```bash
# Cloner le dépôt (ou ouvrir le projet)
cd piggyback

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L’application est disponible sur **http://localhost:5173/** (ou un autre port si 5173 est occupé).

## Scripts

| Commande        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Serveur de développement Vite |
| `npm run build`| Build de production            |
| `npm run preview` | Prévisualiser le build      |
| `npm run check`| Vérification TypeScript        |

## Structure du projet

```
piggyback/
├── client/                 # Frontend React (racine Vite)
│   ├── public/             # Fichiers statiques (SW, manifest, icônes)
│   └── src/
│       ├── components/     # Composants réutilisables et UI (shadcn)
│       ├── contexts/       # SyncContext
│       ├── hooks/          # use-goals, use-settings, use-language, etc.
│       ├── lib/            # localStorage, i18n, supabase, basePath
│       └── pages/          # Landing, Tutorial, Dashboard, GoalDetails, Settings
├── shared/                 # Schémas et types partagés
│   ├── schema.ts
│   └── routes.ts
├── deploy/                 # Config déploiement (Apache)
├── supabase/               # Migrations Supabase (sync optionnelle)
├── vite.config.ts
├── package.json
└── README.md
```

## Stack technique

- **Build** : Vite 7, React 18, TypeScript
- **Routing** : Wouter
- **État serveur / cache** : TanStack React Query
- **UI** : Tailwind CSS, Radix UI (shadcn), Framer Motion, Lucide React
- **Formulaires** : react-hook-form, Zod
- **Données** : localStorage (principal), Supabase (optionnel)
- **i18n** : fichier de traductions (fr, en, mg) dans `client/src/lib/i18n.ts`

## Synchronisation cloud (optionnelle)

Pour activer la synchronisation Supabase :

1. Créer un projet sur [Supabase](https://supabase.com).
2. Créer un fichier `.env` à la racine du projet :

   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_anon_key
   ```

3. Exécuter les migrations dans `supabase/migrations/` si nécessaire.

Sans ces variables, l’application fonctionne entièrement en local (localStorage).

## Déploiement

- **Build** : `npm run build` → sortie dans `dist/`.
- **Base path** : le build utilise `base: "./"` ; il peut être servi à la racine (`/`) ou dans un sous-dossier (ex. `/piggyback/`). Le base path est détecté automatiquement au chargement.
- **Apache** : voir `deploy/README.md` et `deploy/apache-piggyback.conf` pour la configuration SPA (fallback sur `index.html`).

## Licence

MIT.
