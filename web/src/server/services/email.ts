import nodemailer from "nodemailer";
import { env } from "@/server/env";
import {
  type EvenementInfoPdf,
  genererPdfCommande,
} from "@/server/services/pdf";
import { genererQrPng } from "@/server/services/qr";
import type { BilletListe } from "@/shared/lib/types";

const QR_SIZE = 220;

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  cid?: string;
}

export interface EmailAEnvoyer {
  to: string;
  subject: string;
  html: string;
  attachments: EmailAttachment[];
}

/**
 * Dépendance injectée pour l'envoi : un faux sender est utilisé en test,
 * aucun envoi réseau réel dans la suite de tests.
 */
export interface EmailSender {
  envoyer(email: EmailAEnvoyer): Promise<void>;
}

export function creerSmtpSender(): EmailSender {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error(
      "Configuration email manquante : renseigner BREVO_API_KEY ou SMTP_HOST, SMTP_PORT, SMTP_USER et SMTP_PASSWORD.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  return {
    async envoyer(email) {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: email.to,
        subject: email.subject,
        html: email.html,
        attachments: email.attachments,
      });
    },
  };
}

/** Découpe `Nom <adresse>` (ou `adresse` seule) pour l'API Brevo. */
export function parserExpediteur(from: string): {
  name?: string;
  email: string;
} {
  const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (!match) return { email: from.trim() };
  const name = match[1].trim();
  return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
}

/**
 * Envoi par l'API HTTPS de Brevo. L'API ne gère pas les images `cid:` : les
 * images intégrées sont retirées du HTML et restent en pièces jointes.
 */
export function creerBrevoSender(
  apiKey: string,
  from: string,
  fetchImpl: typeof fetch = fetch,
): EmailSender {
  return {
    async envoyer(email) {
      const html = email.html.replace(
        /<img\b[^>]*\bsrc="cid:[^"]*"[^>]*>/g,
        "",
      );
      const response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: parserExpediteur(from),
          to: [{ email: email.to }],
          subject: email.subject,
          htmlContent: html,
          attachment: email.attachments.map((a) => ({
            name: a.filename,
            content: a.content.toString("base64"),
          })),
        }),
      });
      if (!response.ok) {
        throw new Error(
          `Brevo a refusé l'envoi (${response.status}) : ${await response.text()}`,
        );
      }
    },
  };
}

/** Brevo (API HTTPS) si BREVO_API_KEY est définie, sinon SMTP. */
export function creerEmailSender(): EmailSender {
  return env.BREVO_API_KEY
    ? creerBrevoSender(env.BREVO_API_KEY, env.SMTP_FROM)
    : creerSmtpSender();
}

export function getAppUrl(): string {
  return env.APP_URL;
}

export interface CommandeEmailInput {
  commandeId: string;
  nom: string;
  email: string;
  billets: BilletListe[];
}

/**
 * Construit et envoie l'email de commande : QR inline pour chaque billet,
 * lien vers la page billet, et le PDF de la commande en pièce jointe.
 */
export async function envoyerEmailCommande(
  sender: EmailSender,
  commande: CommandeEmailInput,
  evenement: EvenementInfoPdf,
  appUrl: string,
): Promise<void> {
  const pdf = await genererPdfCommande(commande, evenement);

  const qrs = await Promise.all(
    commande.billets.map(async (billet, index) => ({
      cid: `qr-${index}@polyqr`,
      billet,
      png: await genererQrPng(billet.code, QR_SIZE),
    })),
  );

  const lien = `${appUrl}/billet?commande=${commande.commandeId}`;
  const pluriel = commande.billets.length > 1;

  const qrHtml = qrs
    .map(
      ({ cid, billet }) => `
        <p style="text-align:center;margin:0 0 24px;">
          <img src="cid:${cid}" alt="QR billet ${billet.code}" width="${QR_SIZE}" height="${QR_SIZE}" />
          <br />
          Billet ${billet.code}
        </p>`,
    )
    .join("");

  const html = `
    <p>Bonjour ${commande.nom},</p>
    <p>Voici ${pluriel ? "tes billets" : "ton billet"} pour ${evenement.nom} (${evenement.date} à ${evenement.heure}, ${evenement.lieu}).</p>
    ${qrHtml}
    <p>Retrouve ${pluriel ? "tes billets" : "ton billet"} en ligne, ou télécharge le PDF joint pour le consulter hors connexion :<br />
    <a href="${lien}">${lien}</a></p>
  `;

  await sender.envoyer({
    to: commande.email,
    subject: `Ton billet — ${evenement.nom}`,
    html,
    attachments: [
      ...qrs.map(({ cid, billet, png }) => ({
        filename: `qr-${billet.code}.png`,
        content: png,
        contentType: "image/png",
        cid,
      })),
      {
        filename: `billets-${commande.commandeId}.pdf`,
        content: Buffer.from(pdf),
        contentType: "application/pdf",
      },
    ],
  });
}
