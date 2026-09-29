import { EvenementForm } from "@/client/components/admin/evenement-form";

export default function AdminNouvelEvenementPage() {
  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 md:px-9">
      <h1 className="font-display font-extrabold text-[24px] tracking-tight sm:text-[30px]">
        Nouvel événement
      </h1>
      <EvenementForm mode="creer" />
    </div>
  );
}
