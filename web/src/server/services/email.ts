import nodemailer from "nodemailer";
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

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !password || !from) {
    throw new Error(
      "Configuration SMTP incomplète (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM).",
    );
  }

  return { host, port: Number(port), user, password, from };
}

export function creerSmtpSender(): EmailSender {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
  });

  return {
    async envoyer(email) {
      await transporter.sendMail({
        from: config.from,
        to: email.to,
        subject: email.subject,
        html: email.html,
        attachments: email.attachments,
      });
    },
  };
}

export function getAppUrl(): string {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL n'est pas défini");
  return value;
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
