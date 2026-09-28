export function BilletIntrouvable() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="font-display font-extrabold text-2xl">
        Billet introuvable
      </div>
      <p className="text-[14px] text-muted">
        Cet identifiant de billet n&apos;existe pas dans la démo.
      </p>
    </main>
  );
}
