# PolyQR — Prototype Next.js

Démo cliquable du parcours PolyQR (voir [../docs/CONTEXT.md](../docs/CONTEXT.md)). Données factices en mémoire côté client, réinitialisées à chaque rechargement — pas de base de données, pas de webhook HelloAsso réel.

## Parcours couverts

- `/` — accueil avec les trois entrées de la démo
- `/billet?id=t2` — billet participant (vrai QR scannable encodant `polyqr:<id>`, entrées, tickets boisson)
- `/login` puis `/scanner` — accès bénévole (mot de passe : `hangar2026`), scan par caméra réelle (`getUserMedia` + décodage `jsQR`), avec repli manuel "Pas de caméra sous la main ?" pour tester sans matériel
- `/scanner/resultat` — les 4 issues possibles d'un scan : valide, déjà scanné, invalidé, inconnu
- `/admin`, `/admin/nouveau`, `/admin/billets` — événement, création de billet de permanence, liste et invalidation

## Développement

```bash
npm install
npm run dev
```

## Déploiement

Déployé sur Vercel. `npx vercel --prod` depuis ce dossier.
