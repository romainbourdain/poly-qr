import { db } from "@/server/db/client";
import { exporterCommandesCsv } from "@/server/services/export";
import { evenementIdSchema } from "@/shared/validators/commande";

// L'accès admin est vérifié par `proxy.ts` (matcher `/admin/:path*`).
export async function GET(request: Request) {
  const evenementId = evenementIdSchema.safeParse(
    new URL(request.url).searchParams.get("evenement"),
  );
  if (!evenementId.success) {
    return new Response("Événement invalide.", { status: 400 });
  }

  const export_ = await exporterCommandesCsv(db, evenementId.data);
  if (!export_) {
    return new Response("Événement introuvable.", { status: 404 });
  }

  return new Response(export_.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${export_.nomFichier}"`,
      "Cache-Control": "no-store",
    },
  });
}
