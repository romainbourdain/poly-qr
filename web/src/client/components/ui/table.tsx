import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Primitives de tableau façon shadcn (Table, TableHeader, TableRow…) : le conteneur gère l'arrondi et le défilement horizontal. */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-ink-2">
      <table
        className={cn("w-full border-collapse text-[14px]", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn("border-line border-b bg-[#1B1B27]", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn(className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-[#22222F] border-b transition-colors last:border-0 hover:bg-ink-3/60",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 text-left font-bold text-[12px] text-faint uppercase tracking-[0.1em] first:pl-5 last:pr-5",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn("p-3 first:pl-5 last:pr-5", className)} {...props} />
  );
}
