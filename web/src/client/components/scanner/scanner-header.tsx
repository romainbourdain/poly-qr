export function ScannerHeader({ evenementNom }: { evenementNom: string }) {
  return (
    <header className="pt-7 pb-2">
      <h1 className="font-display font-extrabold text-[30px] leading-tight tracking-tight sm:text-[34px]">
        {evenementNom}
      </h1>
    </header>
  );
}
