import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link
        href="/"
        className="mb-10 flex flex-col items-center gap-3 text-center"
      >
        <div className="grid h-12 w-12 place-items-center border border-accent/45 font-serif text-2xl text-accent">
          M
        </div>
        <div>
          <div className="text-lg font-semibold">Mijn Financiën</div>
          <div className="text-xs text-muted-foreground">
            Persoonlijk financieel overzicht
          </div>
        </div>
      </Link>
      <div className="w-full max-w-[440px]">{children}</div>
    </div>
  );
}
