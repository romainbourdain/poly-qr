# PolyQR — Prototype Next.js

Démo cliquable du parcours PolyQR (voir [../docs/CONTEXT.md](../docs/CONTEXT.md)). Données factices en mémoire côté client, réinitialisées à chaque rechargement — pas de base de données, pas de webhook HelloAsso réel.

Déployé sur Vercel : **https://app-eight-sigma-27.vercel.app**

## Parcours couverts

- `/` — accueil avec les trois entrées de la démo
- `/billet?id=t2` — billet participant (vrai QR scannable encodant `polyqr:<id>`, entrées, tickets boisson)
- `/login` puis `/scanner` — accès bénévole (mot de passe : `hangar2026`), scan par caméra réelle (`getUserMedia` + décodage `jsQR`), avec repli manuel "Pas de caméra sous la main ?" pour tester sans matériel
- `/scanner/resultat` — les 4 issues possibles d'un scan : valide, déjà scanné, invalidé, inconnu
- `/admin`, `/admin/nouveau`, `/admin/billets` — événement, création de billet de permanence, liste et invalidation, **responsive** (sidebar desktop fixe → barre du haut avec menu hamburger sous `md`, tableau de billets → cartes empilées sur mobile)

## Architecture

- **Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript**, aucune dépendance serveur (pas de route API, pas de DB).
- `lib/store.tsx` — tout l'état de la démo (billets, actions `addTicket`/`scanTicket`/`invalidateTicket`/`reactivateTicket`) dans un `React.Context` alimenté par un jeu de données factices (`SEED`). Persiste le temps d'une session de navigation (navigation client, pas de rechargement complet) mais jamais entre deux appareils ou deux onglets.
- `lib/event.ts` — les infos de l'événement (nom, date, mot de passe), séparées de `store.tsx` car ce dernier est marqué `"use client"` : un composant serveur qui importerait une constante depuis un module client recevrait une référence client invalide (`$undefined`) plutôt que la valeur — piège rencontré sur la page d'accueil, corrigé en isolant les données statiques dans un module sans `"use client"`.
- `components/RealQr.tsx` — génère un vrai QR code scannable (`qrcode`) encodant `polyqr:<id>`.
- `components/CameraScanner.tsx` — demande l'accès caméra (`getUserMedia`) et décode en boucle (`requestAnimationFrame` + `jsQR`), avec gestion des états (attente, refusé, indisponible).

## Développement

```bash
npm install
npm run dev
```

## Déploiement

Déployé sur Vercel. `npx vercel --prod` depuis ce dossier.
