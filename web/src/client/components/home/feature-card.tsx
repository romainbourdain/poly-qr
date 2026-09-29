import Link from "next/link";

export function FeatureCard({
  href,
  eyebrow,
  title,
  desc,
  cta,
  accent,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-3xl border border-line bg-ink-2 p-7 transition hover:border-line-2 hover:bg-ink-3"
    >
      <div
        className="flex size-11 items-center justify-center rounded-xl font-extrabold text-ink text-lg"
        style={{ background: accent }}
        aria-hidden="true"
      >
        →
      </div>
      <div className="flex flex-col gap-2">
        <div className="font-bold text-[12px] text-muted uppercase tracking-[0.16em]">
          {eyebrow}
        </div>
        <h2 className="font-display font-extrabold text-2xl tracking-tight">
          {title}
        </h2>
        <div className="text-[14px] text-muted leading-relaxed">{desc}</div>
      </div>
      <div className="mt-1 font-bold text-[14px] text-accent-3 group-hover:text-accent-2">
        {cta} →
      </div>
    </Link>
  );
}
