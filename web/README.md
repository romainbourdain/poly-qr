# PolyQR — Prototype Next.js

Billetterie QR de l'association (voir [../docs/CONTEXT.md](../docs/CONTEXT.md)) : les billets sont créés soit par le webhook HelloAsso, soit en permanence par un organisateur ; un QR est envoyé par email et scanné à l'entrée par les bénévoles. Tout est persisté en Postgres (Drizzle) et lu via des server actions.

Déployé sur Vercel : **https://app-eight-sigma-27.vercel.app**

## Parcours couverts

- `/` — accueil avec les deux entrées (participant, admin)
- `/billet?commande=<id>` — page participant d'une commande : un QR scannable par billet (`polyqr:<code>`), tickets boisson, téléchargement PDF (`/billet/<id>/pdf`). Affiche l'événement *de la commande*, même après sa fin
- `/login` — accès admin, protégé par `ADMIN_PASSWORD` (variable d'environnement, cookie de session signé)
- `/scanner/<id-événement>` — un scanner par événement, protégé par le mot de passe *de cet événement* (`/scanner/<id>/login`, session valable pour cet événement seulement) ; scan par caméra réelle (`getUserMedia` + décodage `jsQR`), avec repli manuel
- `/scanner/<id-événement>/resultat` — les 4 issues d'un scan : valide, déjà scanné, invalidé, inconnu (un billet d'un autre événement est « inconnu »)
- `/admin` — événement choisi dans le sélecteur de la sidebar (`?evenement=<id>`, par défaut le plus récent) : lien HelloAsso à copier, lien et QR du scanner, édition (nom, date, heure, lieu, mot de passe scanner, tarifs cotisant et non cotisant en pré-vente et sur place, prix du ticket boisson). Le même sélecteur pilote `/admin/statistiques`, `/admin/nouveau` et `/admin/billets`
- `/admin/statistiques` — chiffres clés, affluence par tranche de 15 min, billets par canal et avancement des entrées (graphiques Recharts), à jour au rechargement de la page
- `/admin/evenements/nouveau` — création d'un événement, puis guide pour relier HelloAsso (URL de webhook propre à l'événement)
- `/admin/nouveau` — vente de billets en main propre, avec total à payer (affichage uniquement, aucun montant stocké) : onglet « Pré-vente » (permanence, QR envoyé par email) ou « Sur place » (sans email, billets déjà scannés) ; nom, prénom, statut cotisant et tickets boisson par billet ; l'onglet par défaut dépend de l'heure de début de l'événement
- `/admin/billets` — liste à plat des billets nominatifs (nom, prénom, email, canal, tarif cotisant ou non) ; recherche et filtre de statut synchronisés à l'URL, tri au clic sur les en-têtes, pagination de 20 billets et invalidation ; l'admin est **responsive**
- `/api/webhooks/helloasso/<id-événement>?secret=…` — création automatique des commandes HelloAsso pour cet événement et envoi de l'email

## Stack

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript. Persistance Postgres via Drizzle (`server/db/`) — voir [Couches backend](#couches-backend) plus bas.

| Domaine | Choix |
|---|---|
| Composants UI | [Base UI](https://base-ui.com) (headless) + design system maison dans `client/components/ui/` (pattern shadcn : on possède et stylise le code, pas une lib de composants finis) |
| Server actions | [next-safe-action](https://next-safe-action.dev) : clients `actionClient` / `adminActionClient` / `scannerActionClient` dans `server/actions/safe-action.ts` (session, validation Zod, erreurs génériques) |
| Formulaires | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) pour la validation |
| État partagé côté client | [Zustand](https://zustand.docs.pmnd.rs) |
| État d'URL (recherche/filtres) | [nuqs](https://nuqs.dev) |
| Variables d'environnement | [t3-env](https://env.t3.gg) (`@t3-oss/env-core`) + Zod, dans `server/env-schema.ts` / `server/env.ts` |
| Lint/format | [Biome](https://biomejs.dev) (remplace ESLint + Prettier), y compris tri et raccourcissement des classes Tailwind |
| Gestion de paquets | [pnpm](https://pnpm.io) |
| Hooks Git | [husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/okonet/lint-staged) |

## Structure des dossiers

Architecture en couches : les pages appellent des server actions / services, qui seuls parlent à la base de données :

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
├── server/                     # Tout ce qui ne doit jamais atteindre le bundle client
│   ├── actions/                #   "use server", un fichier par domaine (auth, tickets, evenements)
│   ├── services/               #   logique métier (billets, événements, auth, email, PDF, HelloAsso)
│   └── db/                     #   client + schéma Drizzle, migrations
│
└── shared/                     # Importable des deux côtés (client ET server)
    ├── lib/                    #   fonctions utilitaires + types (cn, search-params, tickets, types)
    ├── validators/             #   schémas Zod (contrat de validation partagé formulaire ↔ server actions)
```

Règles qui se dégagent de ce découpage :

- **`app/`** reste le plus fin possible : une page assemble des composants de `client/components/`, elle ne contient pas de logique métier.
- **`client/`** ne contient que du code `"use client"` ou consommé uniquement par du code client. Rien ici ne doit importer depuis `server/`.
- **`server/`** est la seule couche autorisée à parler à la base de données ; `server/db/` contient le schéma et le client Drizzle, `server/actions/` (point d'entrée `"use server"`) et `server/services/` (logique métier) sont les seuls à l'utiliser.
- **`shared/`** est neutre : `lib/` et `validators/` ne dépendent ni de React ni de Next.js server-only, donc importables aussi bien par un composant client que par une server action qui revalide les mêmes schémas Zod côté serveur.

### Alias d'import

Les tests (`web/tests/`) sont hors de `src/` et reproduisent son arborescence.

`@/*` pointe vers `src/*` (`tsconfig.json`). Exemples : `@/client/components/ui/button`, `@/shared/validators/new-ticket`, `@/client/store/scan-result-store`.

### Pourquoi Zustand plutôt qu'un Context React

Un `React.Context` fait re-render **tous** ses consommateurs à chaque mutation, même ceux qui ne lisent qu'une partie de l'état. Un store Zustand permet des sélecteurs qui ne re-rendent que si la valeur lue change. Le seul store actuel est `client/store/scan-result-store.ts` (résultat du dernier scan, transmis de l'écran scanner à `/scanner/resultat`) ; les données billets viennent de la DB via les server actions.

### Couches backend

`server/db/` contient le schéma Drizzle (`schema.ts` : `evenements`, `commandes`, `billets`) et le client Postgres (`client.ts`, lit `DATABASE_URL`). Les pages et composants passent par `server/actions/` (`auth`, `tickets`, `evenements`), qui délèguent à `server/services/`. Il n'y a pas d'événement « actif » : l'admin en choisit un explicitement. Les prix de l'événement sont en centimes : pré-vente et sur place, chacun avec un tarif cotisant et non cotisant ; ils servent au total affiché en vente et aux estimations des statistiques.

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

Deux cibles : Vercel (`npx vercel --prod` depuis ce dossier, dont le dossier racine doit pointer sur `web/`) et un VPS via Docker.

### VPS (Docker)

`Dockerfile` (multi-stage, output Next.js `standalone`, image finale non-root, aucun secret embarqué : la validation d'env est désactivée au build seulement) et `docker-compose.yml` : `db` (Postgres + volume `pgdata`), `migrate` (one-shot, applique les migrations Drizzle) puis `app`.

Sur le VPS, dans un dossier contenant `docker-compose.yml` et un `.env` (toutes les variables de `.env.example` sauf `DATABASE_URL`, plus `POSTGRES_PASSWORD`) :

```bash
docker compose pull app   # image publiée sur GHCR (voir Release)
docker compose up -d      # db -> migrate -> app, port 3000 (APP_PORT pour changer)
```

`POSTGRES_PASSWORD` est inséré tel quel dans `DATABASE_URL` : éviter les caractères spéciaux d'URL (`@ : / ? #`).

`APP_IMAGE` permet de fixer un tag précis (ex. `APP_IMAGE=ghcr.io/romainbourdain/poly-qr:0.1.0-r3`). En local, `docker compose up -d --build` construit l'image.

### Release

Un push sur la branche `build` (`.github/workflows/release.yml`) crée le tag git `<version>-r<N>` (version de `package.json`, `N` incrémenté, remis à 1 quand la version change) et publie l'image `ghcr.io/romainbourdain/poly-qr` avec les tags `<version>-r<N>`, `latest` et le SHA court. Pas de GitHub Release ni de déploiement automatique.

```bash
git push origin main:build   # déclenche la release
# puis, sur le VPS :
docker compose pull app && docker compose up -d
```

La CI (`.github/workflows/ci.yml`) lance lint, typecheck, tests (Postgres de service) et build sur les PR et sur `main`.

### Variables d'environnement

Toutes les variables sont déclarées et validées (Zod) dans `server/env-schema.ts` ; le reste du code lit `env` depuis `@/server/env`, jamais `process.env` (exceptions : `NODE_ENV`, `SKIP_ENV_VALIDATION`). `next.config.ts` importe ce module, donc `pnpm dev` et `pnpm build` échouent tôt avec la liste des variables manquantes ou invalides. `.env.example` liste toutes les variables.

- `SKIP_ENV_VALIDATION=1` désactive la validation, par exemple pour builder l'image Docker sans secrets (build uniquement : ne jamais l'activer au démarrage réel, les valeurs ne sont alors ni validées ni converties, ex. `SMTP_PORT` reste une chaîne). Vitest l'active aussi : les tests posent leurs propres valeurs, et le schéma est testé dans `tests/server/env.test.ts`.
- `drizzle.config.ts` réutilise le schéma mais ne valide que `DATABASE_URL`.
- `DATABASE_URL_TEST` est optionnelle (tests uniquement).
