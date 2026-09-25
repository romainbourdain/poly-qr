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
