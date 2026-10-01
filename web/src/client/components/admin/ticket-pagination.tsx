import { Button } from "@/client/components/ui/button";

/** Pied de tableau façon shadcn : position à gauche, Précédent / Suivant à droite. */
export function TicketPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination des billets"
      className="flex items-center justify-between gap-3"
    >
      <span className="text-[13px] text-muted">
        Page {page} sur {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Précédent
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </nav>
  );
}
