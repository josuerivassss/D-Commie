# B-Commie Dashboard (React + Vite)

Static frontend for B-Commie: a landing page plus a Discord-OAuth
dashboard (General, Welcome, Leave, Starboard) that talks entirely to your
A-Commie API over `fetch()` -- no server-side rendering, no backend of its
own. Deployable as pure static files (Vercel, GitHub Pages, or any static
host).

## How auth works

1. "Log in with Discord" sends the browser straight to Discord's OAuth
   consent screen (no API call needed for this step -- it needs no secret).
2. Discord redirects to **your API's** `/json/auth/callback` (registered in
   the Discord Developer Portal), which exchanges the code for a token and
   redirects back here to `/auth/callback?token=...`.
3. This app stores that token (a JWT issued by your API, not Discord's own
   token) in `localStorage` and attaches it as `Authorization: Bearer ...`
   on every API call from then on.

No secrets ever touch this frontend -- the Discord Client Secret stays on
your API.

## Local development

```bash
npm install
cp .env.example .env
# fill in VITE_API_BASE_URL and VITE_DISCORD_CLIENT_ID
npm run dev
```

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. [vercel.com/new](https://vercel.com/new) -> import the repo -> it auto-detects Vite.
3. Add the environment variables from `.env.example` in the Vercel project
   settings (Settings -> Environment Variables).
4. Deploy. `vercel.json` already handles client-side routing (so refreshing
   `/dash/123/welcome` doesn't 404).
5. Once you have your Vercel URL (or a custom domain), set your API's
   `FRONTEND_URL` and `CORS_ORIGINS` to match it, and redeploy the API.

## Project layout

```
src/
├── main.jsx / App.jsx     # entry point + routes
├── config.js                # env vars, Discord URL builders
├── auth.js                   # token storage
├── api.js                     # fetch wrapper (attaches Bearer token)
├── components/
│   ├── Header.jsx
│   ├── GuildCard.jsx
│   └── Sidebar.jsx
└── pages/
    ├── Landing.jsx
    ├── AuthCallback.jsx
    ├── GuildPicker.jsx          # /dash
    ├── DashboardLayout.jsx        # sidebar shell for /dash/:guildId/*
    ├── GeneralSettings.jsx
    ├── WelcomeSettings.jsx
    ├── LeaveSettings.jsx
    └── StarboardSettings.jsx
```

## Adding a new settings page

1. Add a page component under `src/pages/`, following the pattern in
   `GeneralSettings.jsx` (fetch on mount via `useOutletContext()` for the
   current `guild`, PATCH on submit).
2. Add a matching API method in `src/api.js`.
3. Register the route in `App.jsx` (nested under `/dash/:guildId`).
4. Add a `NavLink` in `components/Sidebar.jsx`.
