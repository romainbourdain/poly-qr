# Décisions actées lors du cadrage

Historique des choix de conception, avec l'alternative écartée quand elle éclaire le pourquoi. Complète [CONTEXT.md](CONTEXT.md), qui décrit le système tel qu'il est ; ce fichier explique comment on y est arrivé.

- **Un seul concept de billet, avec un nombre d'entrées variable.** Écarté : deux objets distincts "billet individuel" et "billet de groupe". Simplifie le modèle de données et l'UI — même écran de scan, juste un nombre différent.
- **Arrivée groupée uniquement, pas d'entrée fractionnée sur un billet à plusieurs entrées.** Un billet à N entrées consomme les N entrées en un seul scan ; le groupe doit être au complet. Pas de mécanisme de "2 sur 4 déjà entrés".
- **Génération du QR automatique via webhook HelloAsso**, plutôt que déclenchée manuellement après export. Réduit le travail des organisateurs et le délai de réception pour l'acheteur.
- **Email custom envoyé par notre système**, pas l'email de billet natif HelloAsso. L'email HelloAsso a un template fixe (PDF, code-barres propriétaire) qui ne permet pas d'injecter notre propre QR.
- **Pas de prix géré par le système.** Écarté : configuration des tarifs par le trésorier dans l'admin. Les prix restent gérés par HelloAsso ou décidés au cas par cas ; ça évite un système de facturation qu'on n'a pas besoin de construire.
- **Pas de remboursement automatique.** Cas jugé assez rare pour un bouton d'invalidation manuelle plutôt qu'une écoute des webhooks de remboursement HelloAsso.
- **Mot de passe partagé unique**, pas de comptes nominatifs par bénévole ni de régénération par événement. Décision "au plus simple pour l'instant" — à revisiter si le besoin de traçabilité par bénévole apparaît.
- **Pas de dashboard temps réel** pendant l'événement. Jugé non nécessaire pour ce POC.
- **Connexion réseau fiable sur les lieux des soirées** → pas de mode hors-ligne pour le scanner. À revalider si un événement futur a lieu dans un endroit avec une mauvaise couverture.
- **Stack Next.js + Postgres sur VPS**, choisie pour la maîtrise de l'écosystème React côté développeur.

## Prototype (démo cliquable)

Un premier prototype a été construit pour valider le parcours avant d'investir dans la vraie base de données et l'intégration HelloAsso. Décisions propres à ce prototype, qui ne s'appliquent pas forcément à la version finale :

- **Démo cliquable avec données factices, pas de vraie base de données.** Écarté : prototype fonctionnel avec Postgres et persistance réelle. Choisi pour livrer vite un support de validation du design et du parcours ; toutes les données vivent en mémoire côté navigateur et sont réinitialisées à chaque rechargement. Conséquence assumée : un billet créé en admin n'est visible/scannable que depuis le même navigateur, jamais partagé entre deux appareils. *(Stockage initialement un `React.Context`, migré vers un store Zustand lors du passage à une architecture en couches — voir [web/README.md](../web/README.md#pourquoi-zustand-plutôt-quun-context-react) — le choix "pas de vraie base de données" reste inchangé.)*
- **Pas de webhook HelloAsso réel branché.** Simulation uniquement via l'interface admin (création manuelle de billet). Évite de dépendre d'un compte HelloAsso de test et du point d'API pas encore vérifié (voir le risque technique identifié plus haut).
- **QR code réellement scannable, pas seulement visuel.** Le billet encode un vrai QR (`polyqr:<id>`, généré avec `qrcode`) et le scanner utilise la caméra réelle du téléphone (`getUserMedia` + décodage `jsQR` en direct), avec un repli manuel pour tester sans caméra. Ajouté après une première version où le "QR" n'était qu'un motif visuel factice, sur demande explicite de pouvoir vraiment scanner.
- **Un seul concept de billet également dans le prototype** (billet = nom + email + N entrées + N tickets boisson), reflet direct de la fusion actée dans le cadrage — pas de re-séparation "individuel/groupe" côté code.
- **Espace admin responsive dès le prototype**, alors que ce n'était pas explicitement cadré au départ : la sidebar desktop fixe devient une barre du haut avec menu hamburger sous `md`, et le tableau de billets devient des cartes empilées sur mobile. Ajouté sur demande, car les organisateurs sont susceptibles d'ouvrir l'admin depuis leur téléphone.
- **Déployé sur Vercel**, pas sur le VPS cible. Plus rapide à mettre en ligne pour un prototype jetable ; la version finale reste prévue sur le VPS de l'association (voir stack ci-dessus).
