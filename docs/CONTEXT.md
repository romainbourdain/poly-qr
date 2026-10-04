# Cadrage du projet

## Objectif

Remplacer le contrôle d'entrée manuel (fichier Excel + pointage humain) par un système de QR code, pour les soirées de l'association. Conçu pour être réutilisé d'un événement à l'autre, pas comme un jetable pour une seule soirée.

## Concepts centraux : commande et billet

Une **commande** = un acte d'achat (un encaissement), identifié par le nom et l'email de l'acheteur·se, qui regroupe un ou plusieurs **billets** et/ou des **tickets boisson**. Un ajout de tickets boisson pour quelqu'un qui a déjà un billet est une nouvelle commande, sans billet.

Un **billet** = une personne. Chaque billet a son propre QR, son propre nombre de tickets boisson, et son propre statut (utilisé/non utilisé/invalidé) — **totalement indépendant des autres billets de la même commande**. Scanner un billet ne consomme que ce billet ; les autres billets de la commande restent valables et scannables séparément, à un autre moment, par une autre personne.

Une personne qui achète pour plusieurs (elle-même incluse ou non) reçoit une commande contenant N billets, un par personne. **Chaque billet est nominatif** : il porte le nom et le prénom de la personne qui entre (le premier billet est celui de l'acheteur·se en vente en main propre ; sur HelloAsso, la personne inscrite sur l'item, sinon celle qui a payé). Le regroupement par commande n'a qu'un rôle d'affichage et de commodité à l'entrée : la page billet d'une commande à plusieurs personnes permet de swiper d'un QR à l'autre sur le même téléphone, pour que le groupe présente ses billets un par un sans changer d'écran ni d'email. Ça n'implique ni arrivée simultanée, ni consommation groupée — voir la décision correspondante dans [DECISIONS.md](DECISIONS.md).

## Les trois origines d'une commande (canaux de vente)

| Origine | Création | QR généré ? |
|---|---|---|
| **HelloAsso** | Automatique, déclenché par webhook à la validation du paiement en ligne | Oui (un par billet de la commande), envoyé par email |
| **Permanence** | Un bénévole saisit le nom, le prénom et l'email de l'acheteur·se (qui sont ceux du premier billet), puis pour chaque billet de la commande son nom, son prénom et son nombre de tickets boisson, dans une interface admin, lors d'une vente à l'avance en main propre (hors HelloAsso) | Oui (un par billet), généré et envoyé par email immédiatement |
| **Sur place le soir** | Un bénévole saisit le nom et le prénom de chaque billet (pas d'email) et ses tickets boisson dans l'admin, à l'encaissement. Prix du billet plus élevé qu'en pré-vente. Les billets naissent déjà « scannés » : la personne entre tout de suite, l'heure de vente est son heure d'entrée. Tickets boisson remis en papier à l'encaissement | Non (aucun QR ni email) |

## Tickets boisson

Add-on **par billet** (donc par personne) plutôt que globalisé sur la commande, à quantité choisie librement en permanence (saisie par le bénévole), et **vendu comme un tarif à part sur HelloAsso** (« Ticket boisson »), donc acheté en autant d'exemplaires que voulu, rattaché au billet de la même personne — voir [DECISIONS.md](DECISIONS.md). Toujours distribués en **papier physique** à l'entrée. Un billet peut recevoir des tickets en plus à tout moment (onglet « Ticket boisson » de Nouveau billet, achat avec son propre moyen de paiement) ; son total est la somme de ses achats. Le système ne fait que dire au bénévole combien en donner au moment du scan d'un billet — aucun suivi numérique de la distribution elle-même. Pour les payeurs sur place (sans QR), le bénévole de la caisse les calcule et les remet à la main, hors système.

## Scan à l'entrée

- Un bénévole utilise son propre smartphone, via une page web protégée par un mot de passe partagé (un seul, le plus simple possible — pas de comptes nominatifs, pas de régénération par événement pour l'instant).
- Un scan valide **un billet** (une personne) une seule fois : son QR est marqué comme utilisé et ne peut pas resservir (anti-partage de capture d'écran). Les autres billets de la même commande ne sont pas affectés.
- Le même poste gère l'entrée et l'indication des tickets boisson à donner pour **ce billet** — pas de poste séparé.
- Connectivité fiable sur les lieux des soirées → vérifications en temps réel côté serveur, pas besoin de mode hors-ligne.
- Recherche par nom prévue en secours (téléphone du participant déchargé, etc.).

## Ce que le système ne fait pas

- **Pas de montant stocké.** L'événement porte quatre prix de billet : pré-vente et sur place, chacun pour cotisant et non cotisant, ainsi qu'un prix de ticket boisson. Ils servent uniquement à calculer le total à payer des formulaires de vente et à estimer les ventes affichées dans les statistiques (les tarifs réellement appliqués par HelloAsso ne sont pas lus). Le système ne gère ni encaissement ni facturation. Il stocke par ailleurs, par commande, le moyen de paiement utilisé (ex. CB, espèces, virement, HelloAsso), et par billet : nom (de la commande), email (de la commande), statut cotisant, statut (utilisé/non utilisé/invalidé) ; les tickets boisson sont des lignes d'achat rattachées à une commande et à un billet.
- **Pas de remboursement automatique.** Cas rare, géré manuellement via l'action « Invalider » du menu de la ligne dans l'admin.
- **Statistiques** : la page admin « Statistiques » (chiffres clés, affluence par tranche de 15 min, billets par canal, entrées) se met à jour au rechargement de la page ; pas de temps réel.

## Multi-admin

Plusieurs personnes du bureau (dont le trésorier) doivent pouvoir créer des billets de permanence et invalider un billet, sans dépendre d'une seule personne. Accès par mot de passe partagé, pas de comptes individuels pour l'instant.

## Risque technique — levé

~~On ne sait pas si le webhook HelloAsso transmet directement le tarif/l'add-on tickets boisson par personne dans son payload, ou s'il faut un appel API de suivi.~~ Levé, avec des webhooks réels de test (Sandbox, 2026-10-04, exemples dans [helloasso-webhooks/](helloasso-webhooks/)) : HelloAsso envoie un webhook par `eventType` pour un même achat (`Order` et `Payment`) ; seul `Order` porte le détail et c'est celui qu'on traite. Son `data.items[]` a un item par billet **et par ticket boisson** (tarifs « Billet cotisant », « Billet non cotisant », « Ticket boisson »), chacun avec son tarif (`name`, `tierId`) et la personne inscrite (`user`). Aucune option, aucun appel à l'API HelloAsso n'est nécessaire. Pas de signature/HMAC documentée sur les webhooks HelloAsso — la vérification se fait par un secret partagé en paramètre de l'URL de callback.

## Stack

Next.js + Postgres, hébergé sur un VPS géré par l'association. Choisi pour la maîtrise de l'écosystème React côté développeur, sans contrainte de budget hébergement particulière au-delà du VPS existant.
