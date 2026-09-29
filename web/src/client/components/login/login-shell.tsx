import type { ReactNode } from "react";

export function LoginShell({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-7">
      <div className="flex flex-col gap-2.5">
        <div className="flex size-13 items-center justify-center rounded-2xl bg-accent">
          <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 12h18" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-[34px] tracking-tight">
          {title}
        </h1>
        <div className="text-[15px] text-muted leading-relaxed">
          {description}
        </div>
      </div>
      {children}
    </main>
  );
}
