# Cadrage du projet

## Objectif

Remplacer le contrôle d'entrée manuel (fichier Excel + pointage humain) par un système de QR code, pour les soirées de l'association. Conçu pour être réutilisé d'un événement à l'autre, pas comme un jetable pour une seule soirée.

## Concept central : le billet

Un **billet** = une entrée dans le système, identifiée par un nom, un email, un nombre d'entrées (1 par défaut, plus si plusieurs personnes arrivent ensemble sur le même QR) et un nombre de tickets boisson associés.

Il n'y a **pas** de distinction "billet individuel" / "billet de groupe" : c'est le même objet, avec un nombre d'entrées qui peut être supérieur à 1. Une personne qui achète pour un groupe reçoit un seul QR ; le groupe entier doit se présenter en même temps, le scan consomme le billet en entier (pas d'arrivée fractionnée).

## Les trois origines d'un billet

| Origine | Création | QR généré ? |
|---|---|---|
| **HelloAsso** | Automatique, déclenché par webhook à la validation du paiement en ligne | Oui, envoyé par email |
| **Permanence** | Un bénévole saisit nom/email/nb d'entrées/nb de tickets boisson dans une interface admin, lors d'une vente à l'avance en main propre (hors HelloAsso) | Oui, généré et envoyé par email immédiatement |
| **Sur place le soir** | Aucune création dans le système. File séparée, prix plus élevé, le bénévole encaisse et laisse entrer directement. Tickets boisson remis en papier, calculés à la main | Non |

## Tickets boisson

Add-on à quantité choisie à l'achat (sur HelloAsso, ou saisie en permanence). Toujours distribués en **papier physique** à l'entrée. Le système ne fait que dire au bénévole combien en donner au moment du scan — aucun suivi numérique de la distribution elle-même. Pour les payeurs sur place (sans QR), le bénévole de la caisse les calcule et les remet à la main, hors système.

## Scan à l'entrée

- Un bénévole utilise son propre smartphone, via une page web protégée par un mot de passe partagé (un seul, le plus simple possible — pas de comptes nominatifs, pas de régénération par événement pour l'instant).
- Un scan valide un billet une seule fois : le QR est marqué comme utilisé et ne peut pas resservir (anti-partage de capture d'écran).
- Le même poste gère l'entrée et l'indication des tickets boisson à donner — pas de poste séparé.
- Connectivité fiable sur les lieux des soirées → vérifications en temps réel côté serveur, pas besoin de mode hors-ligne.
- Recherche par nom prévue en secours (téléphone du participant déchargé, etc.).

## Ce que le système ne fait pas

- **Pas de gestion de prix.** Les tarifs restent gérés par HelloAsso ou décidés au cas par cas en permanence / sur place. Le système ne stocke que nom, email, nombre d'entrées, nombre de tickets boisson, statut (utilisé/non utilisé/invalidé).
- **Pas de remboursement automatique.** Cas rare, géré manuellement via un bouton d'invalidation dans l'admin.
- **Pas de dashboard temps réel** pendant l'événement (jugé non nécessaire pour ce POC).

## Multi-admin

Plusieurs personnes du bureau (dont le trésorier) doivent pouvoir créer des billets de permanence et invalider un billet, sans dépendre d'une seule personne. Accès par mot de passe partagé, pas de comptes individuels pour l'instant.

## Risque technique à lever tôt

On ne sait pas si le webhook HelloAsso transmet directement le tarif/l'add-on tickets boisson par personne dans son payload, ou s'il faut un appel API de suivi (`GET /items/{itemId}`) pour les récupérer. HelloAsso a une API OAuth2 gratuite et illimitée pour les associations (dev.helloasso.com), mais ce point précis n'est pas documenté publiquement — à vérifier avec un webhook de test avant de coder l'intégration.

## Stack

Next.js + Postgres, hébergé sur un VPS géré par l'association. Choisi pour la maîtrise de l'écosystème React côté développeur, sans contrainte de budget hébergement particulière au-delà du VPS existant.
