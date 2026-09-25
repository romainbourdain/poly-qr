# Maquette PolyQR

Écrans maquettés au format `.dc.html` (Design Component), le format source de l'outil de maquettage utilisé pour ce projet. Ce ne sont **pas des pages HTML autonomes** : elles dépendent d'un runtime (`support.js`) fourni par l'outil et ne s'ouvrent pas directement dans un navigateur.

Pour les consulter interactivement : https://claude.ai/artifact/7dYqDzdfVwNb6f1RRibefm (accès privé — demander l'accès si besoin).

## Écrans

**Participant / bénévole (mobile)**
- `Main.dc.html` — billet reçu par email, 1 entrée
- `BilletPlusieurs.dc.html` — même billet, plusieurs entrées (même écran, même composant)
- `Login.dc.html` — accès au scanner par mot de passe partagé
- `Scanner.dc.html` — viseur de scan
- `ScanOk.dc.html` / `ScanOkPlusieurs.dc.html` — scan valide, 1 ou plusieurs entrées
- `ScanUtilise.dc.html` — billet déjà scanné
- `ScanInconnu.dc.html` — QR non reconnu

**Admin (desktop)**
- `AdminEvenements.dc.html` — liste des événements, lien HelloAsso, mot de passe bénévoles
- `AdminNouveauBillet.dc.html` — création d'un billet de permanence
- `AdminBillets.dc.html` — liste et recherche des billets, invalidation

`canvas.json` est l'index qui positionne ces écrans sur le canvas de l'outil de maquettage.
