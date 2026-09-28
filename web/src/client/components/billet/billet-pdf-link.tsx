import { buttonVariants } from "@/client/components/ui/button";

export function BilletPdfLink({ commandeId }: { commandeId: string }) {
  return (
    <a
      href={`/billet/${commandeId}/pdf`}
      download
      className={buttonVariants({ variant: "secondary", size: "md" })}
    >
      Télécharger en PDF
    </a>
  );
}
