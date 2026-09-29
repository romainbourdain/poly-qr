import { cn } from "@/shared/lib/cn";

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-4"
    >
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-4"
    >
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function pagesAffichees(
  page: number,
  totalPages: number,
): (number | `ellipsis-${number}`)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1, page - 1, page, page + 1, totalPages]
    .filter((value) => value >= 1 && value <= totalPages)
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort((a, b) => a - b);

  return pages.flatMap((value, index) =>
    index > 0 && value - pages[index - 1] > 1
      ? [`ellipsis-${value}` as `ellipsis-${number}`, value]
      : [value],
  );
}

const NAVIGATION_BUTTON =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] px-3 font-semibold text-[13px] text-muted transition hover:bg-ink-4 hover:text-fg disabled:pointer-events-none disabled:opacity-45";

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
    <nav aria-label="Pagination des billets" className="flex justify-start">
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            className={NAVIGATION_BUTTON}
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
            <span className="hidden sm:inline">Précédent</span>
            <span className="sr-only sm:hidden">Précédent</span>
          </button>
        </li>
        {pagesAffichees(page, totalPages).map((item) =>
          typeof item === "string" ? (
            <li
              key={item}
              aria-hidden="true"
              className="flex size-9 items-center justify-center text-muted"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  "flex size-9 items-center justify-center rounded-[9px] font-semibold text-[13px] transition",
                  item === page
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-ink-4 hover:text-fg",
                )}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={NAVIGATION_BUTTON}
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="sr-only sm:hidden">Suivant</span>
            <ChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  );
}
