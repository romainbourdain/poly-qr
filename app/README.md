# PolyQR — Prototype Next.js

Démo cliquable du parcours PolyQR (voir [../docs/CONTEXT.md](../docs/CONTEXT.md)). Données factices en mémoire côté client, réinitialisées à chaque rechargement — pas de base de données, pas de webhook HelloAsso réel.

## Parcours couverts

- `/` — accueil avec les trois entrées de la démo
- `/billet?id=t2` — billet participant (QR factice, entrées, tickets boisson)
- `/login` puis `/scanner` — accès bénévole (mot de passe : `hangar2026`) et simulation de scans
- `/scanner/resultat` — les 4 issues possibles d'un scan : valide, déjà scanné, invalidé, inconnu
- `/admin`, `/admin/nouveau`, `/admin/billets` — événement, création de billet de permanence, liste et invalidation

## Développement

```bash
npm install
npm run dev
```

## Déploiement

Déployé sur Vercel. `npx vercel --prod` depuis ce dossier.
