# PolyQR — Prototype Next.js

Démo cliquable du parcours PolyQR (voir [../docs/CONTEXT.md](../docs/CONTEXT.md)). Données factices en mémoire côté client, réinitialisées à chaque rechargement — pas de base de données, pas de webhook HelloAsso réel.

Déployé sur Vercel : **https://app-eight-sigma-27.vercel.app**

## Parcours couverts

- `/` — accueil avec les trois entrées de la démo
- `/billet?id=t2` — billet participant (vrai QR scannable encodant `polyqr:<id>`, entrées, tickets boisson)
- `/login` puis `/scanner` — accès bénévole (mot de passe : `hangar2026`), scan par caméra réelle (`getUserMedia` + décodage `jsQR`), avec repli manuel "Pas de caméra sous la main ?" pour tester sans matériel
- `/scanner/resultat` — les 4 issues possibles d'un scan : valide, déjà scanné, invalidé, inconnu
- `/admin`, `/admin/nouveau`, `/admin/billets` — événement, création de billet de permanence, liste (recherche + filtre synchronisés à l'URL) et invalidation, **responsive** (sidebar desktop fixe → barre du haut avec menu hamburger sous `md`, tableau de billets → cartes empilées sur mobile)

## Stack

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript, aucune dépendance serveur pour l'instant (pas de route API, pas de DB — voir [Couches backend](#couches-backend-vides) plus bas).

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

Architecture en couches, pensée pour accueillir les server actions et l'accès base de données (Drizzle, pas encore branché) sans redécouper le frontend existant :

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
│   └── store/                  #   état partagé client (ticket-store.ts, Zustand)
│
├── server/                     # Futur : tout ce qui ne doit jamais atteindre le bundle client
│   ├── actions/                #   "use server", un fichier par domaine (ex. tickets.ts, auth.ts)
│   ├── services/               #   logique métier, orchestration, agnostique de la DB
│   └── db/                     #   client + schéma Drizzle, migrations
│
└── shared/                     # Importable des deux côtés (client ET server)
    ├── lib/                    #   fonctions utilitaires + types (cn, search-params, tickets, types)
    ├── validators/             #   schémas Zod (contrat de validation partagé formulaire ↔ futures actions)
    └── mock/                   #   données factices (event.ts, tickets.ts) — à remplacer par la DB
```

Règles qui se dégagent de ce découpage :

- **`app/`** reste le plus fin possible : une page assemble des composants de `client/components/`, elle ne contient pas de logique métier.
- **`client/`** ne contient que du code `"use client"` ou consommé uniquement par du code client. Rien ici ne doit importer depuis `server/`.
- **`server/`** (actuellement vide, juste des `.gitkeep`) accueillera les server actions ; c'est la seule couche autorisée à parler à la base de données.
- **`shared/`** est neutre : `lib/` et `validators/` ne dépendent ni de React ni de Next.js server-only, donc importables aussi bien par un composant client que par une future server action qui voudrait revalider les mêmes schémas Zod côté serveur. `mock/` est la donnée de démo actuelle, vouée à disparaître quand `server/db/` sera branché.

### Alias d'import

`@/*` pointe vers `src/*` (`tsconfig.json`). Exemples : `@/client/components/ui/button`, `@/shared/validators/new-ticket`, `@/client/store/ticket-store`.

### Pourquoi Zustand plutôt qu'un Context React

L'état des billets était porté par un `React.Context` : toute mutation (scan, invalidation...) faisait re-render **tous** les composants qui consomment le store, même ceux qui ne lisent qu'un seul billet. `client/store/ticket-store.ts` expose maintenant :

- `useTicketStore()` — accès à la liste complète + actions (`addTicket`, `scanTicket`, `invalidateTicket`, `reactivateTicket`), utilisé là où la liste entière est de toute façon nécessaire (page billets, dashboard admin).
- `useTicket(id)` — sélecteur qui ne re-render que si **ce** billet précis change (page billet participant, écran de résultat de scan).

Plus besoin de `StoreProvider` dans `app/layout.tsx`.

### Couches backend vides

`server/actions/`, `server/services/` et `server/db/` ne contiennent que des `.gitkeep` : aucune server action ni ORM n'est branché pour l'instant (le prototype reste 100 % données factices en mémoire, voir `shared/mock/`). L'ORM prévu pour `server/db/` est **Drizzle**, pas encore installé.

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
