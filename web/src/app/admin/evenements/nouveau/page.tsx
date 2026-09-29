import { EvenementForm } from "@/client/components/admin/evenement-form";

export default function AdminNouvelEvenementPage() {
  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
          Nouvel événement
        </h1>
        <p className="text-[14px] text-muted">
          Les autres événements ne sont pas modifiés. Tu relieras HelloAsso à
          celui-ci juste après.
        </p>
      </div>
      <EvenementForm mode="creer" />
    </div>
  );
}
