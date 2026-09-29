export function BilletIntrouvable() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display font-extrabold text-2xl">
        Billet introuvable
      </h1>
      <p className="text-[14px] text-muted">
        Ce lien ne mène à aucun billet. Rouvre l&apos;email reçu à l&apos;achat
        et utilise le lien qu&apos;il contient.
      </p>
    </main>
  );
}
