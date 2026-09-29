import { notFound } from "next/navigation";
import { LoginForm } from "@/client/components/login/login-form";
import { LoginShell } from "@/client/components/login/login-shell";
import { db } from "@/server/db/client";
import { obtenirEvenement } from "@/server/services/evenements";
import { evenementIdSchema } from "@/shared/validators/commande";

export const dynamic = "force-dynamic";

export default async function ScannerLoginPage({
  params,
}: {
  params: Promise<{ evenementId: string }>;
}) {
  const evenementId = evenementIdSchema.safeParse((await params).evenementId);
  if (!evenementId.success) notFound();

  const evenement = await obtenirEvenement(db, evenementId.data);
  if (!evenement) notFound();

  return (
    <LoginShell
      title="Accès équipe"
      description={
        <>
          {evenement.nom} · {evenement.date}
          <br />
          Entre le mot de passe donné par l&apos;organisateur.
        </>
      }
    >
      <LoginForm
        evenementId={evenement.id}
        label="Mot de passe de la soirée"
        submitLabel="Ouvrir le scanner"
      />
    </LoginShell>
  );
}
