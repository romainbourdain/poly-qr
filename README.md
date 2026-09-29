# PolyQR

Système de QR code pour l'entrée aux soirées du BDE TPS, en remplacement du contrôle manuel sur fichier Excel.

## Le problème actuel

Les places sont payées sur HelloAsso, la liste des payeurs est suivie dans un fichier Excel, et à l'entrée une personne coche manuellement chaque arrivant dans ce fichier et distribue les tickets boisson correspondants. Processus lent, source d'erreurs, et rien pour les paiements en dehors de HelloAsso (permanences, paiement sur place).

## Ce que fait PolyQR

Chaque billet (HelloAsso, permanence, ou saisi manuellement) génère un QR code envoyé par email. À l'entrée, un bénévole scanne le QR depuis son smartphone via une page web protégée : le billet est validé (usage unique) et le nombre de tickets boisson à remettre en papier s'affiche.

Voir [docs/CONTEXT.md](docs/CONTEXT.md) pour le cadrage complet (périmètre, décisions, hors-scope) et [docs/DECISIONS.md](docs/DECISIONS.md) pour le détail des choix actés lors du cadrage initial.

## Maquette

Les écrans (billet participant, scanner bénévole, interface admin) sont maquettés dans [design/mockup/](design/mockup/). Version interactive : https://claude.ai/artifact/7dYqDzdfVwNb6f1RRibefm (accès privé).

## Prototype

Un prototype cliquable est déployé sur Vercel : **https://app-eight-sigma-27.vercel.app**

Code source dans [web/](web/) — voir [web/README.md](web/README.md) pour le détail des parcours couverts et leurs limites. En résumé : données factices en mémoire (pas de base de données, pas de webhook HelloAsso réel), vrai scan de QR code par caméra, espace admin responsive mobile/desktop.

## Stack prévue (version finale)

Next.js + Postgres, hébergé sur un VPS. Le prototype ci-dessus réutilise Next.js mais sans base de données ni hébergement définitif — voir [docs/DECISIONS.md](docs/DECISIONS.md) pour ce qui distingue le prototype de la version cible.
