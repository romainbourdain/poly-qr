# Webhooks HelloAsso réels (Sandbox, 2026-10-04)

Payloads capturés sur une billetterie sandbox aux tarifs « Billet cotisant » (4 €, tier 23557), « Billet non cotisant » (5 €, tier 23558) et « Ticket boisson » (6 €, tier 23559). Chaque achat envoie deux webhooks, dans un ordre variable : `.order.json` (traité) et `.payment.json` (ignoré). Ce sont les fixtures de `web/tests/app/api/webhooks/helloasso/route.test.ts`.

| Fichier | Achat |
|---|---|
| 01 | 1 billet cotisant |
| 02 | 1 billet non cotisant |
| 03 | 1 billet cotisant + 1 ticket boisson |
| 04 | 1 billet cotisant + 3 tickets boisson |
| 05 | 2 billets (2 personnes) + 1 ticket boisson de la 2e |
| 06 | 2 billets + 2 tickets boisson, un par personne |
| 07 | 1 billet cotisant + 1 billet non cotisant |
| 08 | 1 ticket boisson seul |

Format : `data.items[]` a un item par billet et par ticket boisson, avec `name`, `tierId`, `user` (prénom, nom), `amount`, `type` (`Registration`), `state`, `ticketUrl` et `qrCode`. Pas de champ quantité, pas d'options. Les e-mails et noms sont fictifs.

Non couverts : dons, codes promo, paiements refusés, remboursements.
