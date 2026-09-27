# AGENTS.md

Instructions for coding agents working in this repo.

## Repo layout

- `web/` — the Next.js app. All code lives here; see [web/README.md](web/README.md) for stack, folder structure, and commands.
- `docs/CONTEXT.md` — the product's domain rules (what a "billet" is, the three origins, what the system deliberately does not do). Read before touching business logic — it explains *why*, not just what.
- `docs/DECISIONS.md` — history of design choices with the discarded alternative. Check before reversing a decision; append here (never rewrite the original entry) when you make a new one.
- `design/mockup/` — reference mockups the prototype's screens were built from.

## Architecture rules (`web/src/`)

Layered: `client/` (browser), `server/` (nothing may import this from `client/`), `shared/` (importable from both, no React/Next-server-only dependencies). Full breakdown in [web/README.md](web/README.md#structure-des-dossiers).

- New UI: compose from `client/components/ui/` (Base UI-based design system) rather than raw HTML or a different component library.
- New forms: TanStack Form + a Zod schema in `shared/validators/`.
- New URL-synced state (filters, search, pagination): nuqs, parser in `shared/lib/search-params.ts`.
- New shared client state: a Zustand store in `client/store/`, one file per domain. Expose a selector hook (like `useTicket` in `ticket-store.ts`) for any lookup by id — a plain full-store read defeats the reason Zustand was chosen over Context (see [web/README.md](web/README.md#pourquoi-zustand-plutôt-quun-context-react)).
- Anything touching a database or external API: `server/actions` (the `"use server"` entry point) → `server/services` (business logic) → `server/db` (Drizzle, not yet installed). Don't put this logic in `client/` or `app/`.
- Filenames: kebab-case.

## Before finishing

From `web/`: `pnpm lint`, `pnpm typecheck`, `pnpm build` must all pass. There is no test suite yet — validate UI changes by running `pnpm dev` and checking the affected route in a browser.

## Language

UI copy is French (student association audience). Code identifiers, types, and comments are English as usual; only user-facing strings and domain terms (`billet`, `entrees`, `scanne`...) are French — match the existing vocabulary instead of inventing translations.
