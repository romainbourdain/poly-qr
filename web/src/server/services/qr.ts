import QRCode from "qrcode";

/**
 * Génère le PNG du QR d'un billet — même contenu (`polyqr:<code>`) partout
 * où un billet est représenté (page web, PDF, email).
 */
export async function genererQrPng(
  code: string,
  taille: number,
): Promise<Buffer> {
  return QRCode.toBuffer(`polyqr:${code}`, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: taille,
    color: { dark: "#16161F", light: "#FFFFFF" },
  });
}
