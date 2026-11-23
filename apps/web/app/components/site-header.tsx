import Image from "next/image";
import Link from "next/link";

/** On the homepage, section links are in-page (#id); elsewhere they point back to "/#id". */
export function SiteHeader({ home = false }: { home?: boolean }) {
  const base = home ? "" : "/";
  const nav = [
    { href: `${base}#platform`, label: "Platform" },
    { href: `${base}#how-it-works`, label: "How it works" },
    { href: home ? "#use-cases" : "/use-cases", label: "Use cases" },
    { href: `${base}#faq`, label: "FAQ" },
  ];

  return (
    <>
      <div className="bg-deep px-4 py-2 text-center text-xs text-white/80 sm:text-[13px]">
        <span className="font-mono text-brand-bright">Early Access</span>
        <span className="mx-2 text-white/30">/</span>
        Now enrolling offshore engineering teams for pilot reviews.{" "}
        <a href="#early-access" className="font-medium text-white underline-offset-4 hover:underline">
          Apply →
        </a>
      </div>

      <header className="sticky top-0 z-20 border-b border-line/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Nazara AI home">
            <Image src="/logo-mark.png" alt="" width={160} height={160} className="h-11 w-11 sm:h-12 sm:w-12" priority />
            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">Nazara AI</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex" aria-label="Main">
            {nav.map((n) =>
              n.href.startsWith("#") ? (
                <a key={n.href} href={n.href} className="transition hover:text-ink">
                  {n.label}
                </a>
              ) : (
                <Link key={n.href} href={n.href} className="transition hover:text-ink">
                  {n.label}
                </Link>
              )
            )}
          </nav>
          <a
            href="#early-access"
            className="shrink-0 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand sm:text-sm"
          >
            Request early access
          </a>
        </div>
      </header>
    </>
  );
}
