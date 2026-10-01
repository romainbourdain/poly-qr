import type { EvenementInfoPdf } from "@/server/services/pdf";
import { nomComplet } from "@/shared/lib/tickets";
import type { BilletListe } from "@/shared/lib/types";

// Couleurs de l'app (globals.css), en dur : les clients mail ne gèrent ni les
// variables CSS ni les polices web, d'où les styles en ligne et les tableaux.
const C = {
  ink: "#101018",
  carte: "#16161f",
  carteHaute: "#1a1a26",
  ligne: "#2b2b3c",
  ligne2: "#343448",
  texte: "#edebf5",
  muted: "#a5a2bc",
  accent: "#6c4bf0",
  accent2: "#a78bfa",
  accent3: "#c4b5fd",
};
const POLICE =
  "'Manrope', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const POLICE_TITRE =
  "'Bricolage Grotesque', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const POLICE_MONO = "'SFMono-Regular', Menlo, Consolas, monospace";

export function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface QrEmail {
  cid: string;
  billet: BilletListe;
  size: number;
}

function carteBillet({ cid, billet, size }: QrEmail): string {
  const tickets = billet.ticketsBoisson;
  return `
    <tr><td style="padding:0 0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.carte};border:1px solid ${C.ligne};border-radius:24px;">
        <tr><td align="center" style="padding:24px 24px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#ffffff;border-radius:16px;padding:12px;line-height:0;">
            <img src="cid:${cid}" alt="QR du billet ${echapperHtml(billet.code)}" width="${size}" height="${size}" style="display:block;border:0;" />
          </td></tr></table>
          <div style="font-family:${POLICE_TITRE};font-weight:800;font-size:21px;line-height:1.2;color:${C.texte};padding-top:16px;">${echapperHtml(nomComplet(billet.prenom, billet.nom))}</div>
          <div style="font-family:${POLICE_MONO};font-size:13px;letter-spacing:0.04em;color:${C.muted};padding-top:4px;">Billet ${echapperHtml(billet.code)}</div>
        </td></tr>
        <tr><td style="padding:0 24px;"><div style="border-top:1px dashed ${C.ligne2};font-size:0;line-height:0;">&nbsp;</div></td></tr>
        <tr><td align="center" style="padding:16px 24px 20px;font-family:${POLICE};">
          <span style="font-family:${POLICE_TITRE};font-weight:800;font-size:28px;color:${C.accent3};">${tickets}</span>
          <span style="font-weight:700;font-size:14px;color:${C.texte};padding-left:8px;">ticket${tickets > 1 ? "s" : ""} boisson</span>
          <div style="font-size:13px;color:${C.muted};padding-top:2px;">Remis à l'entrée</div>
        </td></tr>
      </table>
    </td></tr>`;
}

/** HTML de l'email de commande, dans le style sombre de l'app et du billet. */
export function genererHtmlCommande(input: {
  nom: string;
  evenement: EvenementInfoPdf;
  qrs: QrEmail[];
  lien: string;
}): string {
  const { nom, evenement, qrs, lien } = input;
  const pluriel = qrs.length > 1;
  const lienHtml = echapperHtml(lien);

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>${echapperHtml(evenement.nom)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.ink}" style="background-color:${C.ink};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;font-family:${POLICE};color:${C.texte};">
    <tr><td style="padding:0 4px 20px;font-family:${POLICE_TITRE};font-weight:800;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:${C.accent2};">BDE TPS</td></tr>
    <tr><td style="padding:0 4px 8px;font-family:${POLICE_TITRE};font-weight:800;font-size:28px;line-height:1.15;color:${C.texte};">${echapperHtml(evenement.nom)}</td></tr>
    <tr><td style="padding:0 4px 24px;font-size:14px;line-height:1.5;color:${C.muted};">${echapperHtml(evenement.date)} · ${echapperHtml(evenement.heure)} · ${echapperHtml(evenement.lieu)}</td></tr>
    <tr><td style="padding:0 4px 20px;font-size:15px;line-height:1.55;color:${C.texte};">Bonjour ${echapperHtml(nom)},<br />voici ${pluriel ? "tes billets" : "ton billet"}. Présente ${pluriel ? "chaque QR" : "le QR"} à l'entrée : ${pluriel ? "chaque billet ne vaut que pour une personne et ne se scanne qu'une fois" : "il ne se scanne qu'une fois"}.</td></tr>
    ${qrs.map(carteBillet).join("")}
    <tr><td align="center" style="padding:8px 0 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${C.accent}" style="background-color:${C.accent};border-radius:11px;">
        <a href="${lienHtml}" style="display:inline-block;padding:14px 26px;font-family:${POLICE};font-weight:700;font-size:15px;color:#ffffff;text-decoration:none;">Voir ${pluriel ? "mes billets" : "mon billet"}</a>
      </td></tr></table>
    </td></tr>
    <tr><td align="center" style="padding:0 4px;font-size:12.5px;line-height:1.55;color:${C.muted};">Le PDF joint te permet de ${pluriel ? "les" : "le"} retrouver hors connexion.<br />Le bouton ne marche pas ? Copie ce lien : <a href="${lienHtml}" style="color:${C.accent2};word-break:break-all;">${lienHtml}</a></td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
