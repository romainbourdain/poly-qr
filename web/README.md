# PolyQR — Prototype Next.js

Démo cliquable du parcours PolyQR (voir [../docs/CONTEXT.md](../docs/CONTEXT.md)). L'UI tourne encore sur des données factices en mémoire côté client, réinitialisées à chaque rechargement — la base Postgres (Drizzle) existe (`server/db/`) mais n'est pas encore branchée aux pages ; pas de webhook HelloAsso réel.

Déployé sur Vercel : **https://app-eight-sigma-27.vercel.app**

## Parcours couverts

- `/` — accueil avec les trois entrées de la démo
- `/billet?id=t2` — billet participant (vrai QR scannable encodant `polyqr:<id>`, entrées, tickets boisson)
- `/login` puis `/scanner` — accès bénévole (mot de passe : `hangar2026`), scan par caméra réelle (`getUserMedia` + décodage `jsQR`), avec repli manuel "Pas de caméra sous la main ?" pour tester sans matériel
- `/scanner/resultat` — les 4 issues possibles d'un scan : valide, déjà scanné, invalidé, inconnu
- `/admin`, `/admin/nouveau`, `/admin/billets` — événement, création de billet de permanence, liste (recherche + filtre synchronisés à l'URL) et invalidation, **responsive** (sidebar desktop fixe → barre du haut avec menu hamburger sous `md`, tableau de billets → cartes empilées sur mobile)

## Stack

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript. Persistance Postgres via Drizzle (`server/db/`), pas encore consommée par l'UI — voir [Couches backend](#couches-backend) plus bas.

| Domaine | Choix |
|---|---|
| Composants UI | [Base UI](https://base-ui.com) (headless) + design system maison dans `client/components/ui/` (pattern shadcn : on possède et stylise le code, pas une lib de composants finis) |
| Formulaires | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) pour la validation |
| État partagé côté client | [Zustand](https://zustand.docs.pmnd.rs) |
| État d'URL (recherche/filtres) | [nuqs](https://nuqs.dev) |
| Lint/format | [Biome](https://biomejs.dev) (remplace ESLint + Prettier), y compris tri et raccourcissement des classes Tailwind |
| Gestion de paquets | [pnpm](https://pnpm.io) |
| Hooks Git | [husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/okonet/lint-staged) |

## Structure des dossiers

Architecture en couches, pensée pour accueillir les server actions au-dessus de la base de données (Drizzle, branché mais pas encore consommé par l'UI) sans redécouper le frontend existant :

```
web/src/
├── app/                        # Routes Next.js (App Router) — emplacement imposé par Next.js
│   ├── admin/                  #   layout + pages événement / nouveau billet / liste billets
│   ├── billet/                 #   écran participant (QR)
│   ├── login/                  #   accès bénévole
│   └── scanner/                #   scan caméra + écran de résultat
│
├── client/                     # Tout ce qui s'exécute côté navigateur
│   ├── components/
│   │   ├── ui/                 #   design system (Button, Input, Field, Tabs, NumberField...)
│   │   ├── admin/ · billet/ · login/ · scanner/ · home/   # composants par domaine métier
│   ├── hooks/                  #   hooks de présentation (ex. use-ticket-filters, nuqs)
│   └── store/                  #   état partagé client (scan-result-store.ts, Zustand)
│
├── server/                     # Futur : tout ce qui ne doit jamais atteindre le bundle client
│   ├── actions/                #   "use server", un fichier par domaine (ex. tickets.ts, auth.ts)
│   ├── services/               #   logique métier, orchestration, agnostique de la DB
│   └── db/                     #   client + schéma Drizzle, migrations
│
└── shared/                     # Importable des deux côtés (client ET server)
    ├── lib/                    #   fonctions utilitaires + types (cn, search-params, tickets, types)
    ├── validators/             #   schémas Zod (contrat de validation partagé formulaire ↔ futures actions)
```

Règles qui se dégagent de ce découpage :

- **`app/`** reste le plus fin possible : une page assemble des composants de `client/components/`, elle ne contient pas de logique métier.
- **`client/`** ne contient que du code `"use client"` ou consommé uniquement par du code client. Rien ici ne doit importer depuis `server/`.
- **`server/`** est la seule couche autorisée à parler à la base de données ; `server/db/` contient le schéma et le client Drizzle, `server/actions/` et `server/services/` (encore vides, `.gitkeep`) accueilleront les server actions et la logique métier.
- **`shared/`** est neutre : `lib/` et `validators/` ne dépendent ni de React ni de Next.js server-only, donc importables aussi bien par un composant client que par une future server action qui voudrait revalider les mêmes schémas Zod côté serveur.

### Alias d'import

Les tests (`web/tests/`) sont hors de `src/` et reproduisent son arborescence.

`@/*` pointe vers `src/*` (`tsconfig.json`). Exemples : `@/client/components/ui/button`, `@/shared/validators/new-ticket`, `@/client/store/scan-result-store`.

### Pourquoi Zustand plutôt qu'un Context React

Un `React.Context` fait re-render **tous** ses consommateurs à chaque mutation, même ceux qui ne lisent qu'une partie de l'état. Un store Zustand permet des sélecteurs qui ne re-rendent que si la valeur lue change. Le seul store actuel est `client/store/scan-result-store.ts` (résultat du dernier scan, transmis de l'écran scanner à `/scanner/resultat`) ; les données billets viennent de la DB via les server actions.

### Couches backend

`server/db/` contient le schéma Drizzle (`schema.ts` : `evenements`, `commandes`, `billets`) et le client Postgres (`client.ts`, lit `DATABASE_URL`). `server/actions/` et `server/services/` ne contiennent encore que des `.gitkeep` : aucune server action ni page ne lit la DB pour l'instant (le prototype reste 100 % données factices en mémoire, voir `shared/mock/`).

## Base de données

Postgres + [Drizzle](https://orm.drizzle.team). Copier `.env.example` en `.env.local` et renseigner `DATABASE_URL` (lu par `pnpm dev`/`pnpm build`/`drizzle-kit`). Pour les tests, renseigner `DATABASE_URL_TEST` (instance séparée) dans `.env.test`, chargé automatiquement par Vitest (`vitest.setup.mts`) — les tests appliquent les migrations et vident les tables entre chaque test.

```bash
pnpm db:generate   # génère une migration à partir de server/db/schema.ts
pnpm db:migrate    # applique les migrations en attente (DATABASE_URL)
```

## Tests

[Vitest](https://vitest.dev). Les tests vivent dans `web/tests/`, qui reproduit l'arborescence de `src/` (import via l'alias `@/`, jamais en relatif). Les tests qui touchent la DB (`tests/server/db/schema.test.ts`, et les tests de `tests/server/services/`) tournent contre une vraie base Postgres de test (`DATABASE_URL_TEST`), pas des mocks — voir `server/db/test-utils/test-db.ts`.

```bash
pnpm test
```

## Développement

```bash
pnpm install
pnpm dev
```

Autres commandes utiles :

```bash
pnpm lint        # Biome (lint)
pnpm lint:fix    # Biome (lint + fix automatique)
pnpm format      # Biome (formatage uniquement)
pnpm typecheck   # tsc --noEmit
pnpm build       # build de production Next.js
```

Un hook `pre-commit` (Biome sur les fichiers stagés) et un hook `pre-push` (`typecheck` complet) sont configurés via husky à la racine du repo (`web/.husky/`).

## Déploiement

Déployé sur Vercel. `npx vercel --prod` depuis ce dossier (le dossier racine du projet Vercel doit pointer sur `web/`).
