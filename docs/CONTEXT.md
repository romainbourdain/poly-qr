# Cadrage du projet

## Objectif

Remplacer le contrôle d'entrée manuel (fichier Excel + pointage humain) par un système de QR code, pour les soirées de l'association. Conçu pour être réutilisé d'un événement à l'autre, pas comme un jetable pour une seule soirée.

## Concepts centraux : commande et billet

Une **commande** = un achat, identifié par le nom et l'email de l'acheteur·se, qui regroupe un ou plusieurs **billets**.

Un **billet** = une personne. Chaque billet a son propre QR, son propre nombre de tickets boisson, et son propre statut (utilisé/non utilisé/invalidé) — **totalement indépendant des autres billets de la même commande**. Scanner un billet ne consomme que ce billet ; les autres billets de la commande restent valables et scannables séparément, à un autre moment, par une autre personne.

Une personne qui achète pour plusieurs (elle-même incluse ou non) reçoit une commande contenant N billets, un par personne. Le regroupement par commande n'a qu'un rôle d'affichage et de commodité à l'entrée : la page billet d'une commande à plusieurs personnes permet de swiper d'un QR à l'autre sur le même téléphone, pour que le groupe présente ses billets un par un sans changer d'écran ni d'email. Ça n'implique ni arrivée simultanée, ni consommation groupée — voir la décision correspondante dans [DECISIONS.md](DECISIONS.md).

## Les trois origines d'une commande

| Origine | Création | QR généré ? |
|---|---|---|
| **HelloAsso** | Automatique, déclenché par webhook à la validation du paiement en ligne | Oui (un par billet de la commande), envoyé par email |
| **Permanence** | Un bénévole saisit nom/email de l'acheteur·se et, pour chaque billet de la commande, son nombre de tickets boisson, dans une interface admin, lors d'une vente à l'avance en main propre (hors HelloAsso) | Oui (un par billet), généré et envoyé par email immédiatement |
| **Sur place le soir** | Aucune création dans le système. File séparée, prix plus élevé, le bénévole encaisse et laisse entrer directement. Tickets boisson remis en papier, calculés à la main | Non |

## Tickets boisson

Add-on à quantité choisie à l'achat (sur HelloAsso, ou saisie en permanence), **par billet** (donc par personne) plutôt que globalisé sur la commande. Toujours distribués en **papier physique** à l'entrée. Le système ne fait que dire au bénévole combien en donner au moment du scan d'un billet — aucun suivi numérique de la distribution elle-même. Pour les payeurs sur place (sans QR), le bénévole de la caisse les calcule et les remet à la main, hors système.

## Scan à l'entrée

- Un bénévole utilise son propre smartphone, via une page web protégée par un mot de passe partagé (un seul, le plus simple possible — pas de comptes nominatifs, pas de régénération par événement pour l'instant).
- Un scan valide **un billet** (une personne) une seule fois : son QR est marqué comme utilisé et ne peut pas resservir (anti-partage de capture d'écran). Les autres billets de la même commande ne sont pas affectés.
- Le même poste gère l'entrée et l'indication des tickets boisson à donner pour **ce billet** — pas de poste séparé.
- Connectivité fiable sur les lieux des soirées → vérifications en temps réel côté serveur, pas besoin de mode hors-ligne.
- Recherche par nom prévue en secours (téléphone du participant déchargé, etc.).

## Ce que le système ne fait pas

- **Pas de gestion de prix pour HelloAsso ni sur place.** Les tarifs y restent gérés par HelloAsso ou décidés au cas par cas — le système n'y stocke aucun montant. Pour la permanence, l'événement porte un prix par billet et un prix par ticket boisson, utilisés uniquement pour calculer et afficher le total à payer dans le formulaire de vente ; le système affiche ce total mais ne gère ni encaissement ni facturation. Il stocke par ailleurs, par commande, le moyen de paiement utilisé (ex. CB, espèces, virement, HelloAsso), et par billet : nom (de la commande), email (de la commande), nombre de tickets boisson, statut (utilisé/non utilisé/invalidé).
- **Pas de remboursement automatique.** Cas rare, géré manuellement via un bouton d'invalidation dans l'admin.
- **Pas de dashboard temps réel** pendant l'événement (jugé non nécessaire pour ce POC).

## Multi-admin

Plusieurs personnes du bureau (dont le trésorier) doivent pouvoir créer des billets de permanence et invalider un billet, sans dépendre d'une seule personne. Accès par mot de passe partagé, pas de comptes individuels pour l'instant.

## Risque technique à lever tôt

On ne sait pas si le webhook HelloAsso transmet directement le tarif/l'add-on tickets boisson par personne dans son payload, ou s'il faut un appel API de suivi (`GET /items/{itemId}`) pour les récupérer. HelloAsso a une API OAuth2 gratuite et illimitée pour les associations (dev.helloasso.com), mais ce point précis n'est pas documenté publiquement — à vérifier avec un webhook de test avant de coder l'intégration.

## Stack

Next.js + Postgres, hébergé sur un VPS géré par l'association. Choisi pour la maîtrise de l'écosystème React côté développeur, sans contrainte de budget hébergement particulière au-delà du VPS existant.
