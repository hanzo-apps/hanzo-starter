# hanzo-starter — agent notes

The canonical Hanzo app starter and the reference the hanzo.app builder forks.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Keep it minimal and REAL — every surface must build and run, no fabricated UI.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Sign-in/home/notes are the three views.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
  `Button` uses `onPress`; `Input` uses `value`/`onChangeText`.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Keep it in
  lockstep with `src/views/notes.tsx`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **Per-app IAM client** is auto-provisioned at publish: Hanzo Cloud upserts this
  fork its OWN client `<org>-app-<slug>` with the EXACT redirect
  `https://<slug>.hanzo.app/auth/callback` (cloud `clients/projects` onPublish →
  IAM `/v1/iam/admin/applications/upsert`), and the deploy injects
  `VITE_HANZO_CLIENT_ID=<org>-app-<slug>`. Redirect matching is exact — never a
  `*.hanzo.app` wildcard on a shared client, which would let any fork receive
  another app's auth code (account takeover). The `hanzo-app` fallback fails
  closed (no `<slug>.hanzo.app` redirect on the shared client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · renders under Vite with zero
console errors · `login()` performs a real PKCE S256 redirect to
`https://hanzo.id/login/oauth/authorize` and hanzo.id serves its sign-in form.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
