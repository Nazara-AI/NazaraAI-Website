import Image from "next/image";
import Link from "next/link";
import { SITE } from "../site";
import { USE_CASES } from "../use-cases/data";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-deep px-4 py-12 text-white/60 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white p-1">
              <Image src="/logo.svg" alt="" width={72} height={72} className="h-7 w-7" />
            </span>
            <span className="font-bold text-white">Nazara AI</span>
          </div>
          <p className="mt-4 max-w-sm text-sm">
            Engineering-aware AI for offshore structural QA/QC. Engineers lead, verify and approve
            every decision.
          </p>
        </div>
        <nav aria-label="Product">
          <p className="font-mono text-xs tracking-wider text-white/40 uppercase">Product</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/#platform" className="hover:text-white">Platform</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/#faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/#early-access" className="hover:text-white">Early access</Link></li>
          </ul>
        </nav>
        <nav aria-label="Use cases">
          <p className="font-mono text-xs tracking-wider text-white/40 uppercase">
            <Link href="/use-cases" className="hover:text-white">Use cases</Link>
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {USE_CASES.map((u) => (
              <li key={u.slug}>
                <Link href={`/use-cases/${u.slug}`} className="hover:text-white">
                  {u.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-mono text-xs tracking-wider text-white/40 uppercase">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="mailto:info@nazara.ai" className="hover:text-white">
                info@nazara.ai
              </a>
            </li>
            <li>
              <a href="mailto:contact@nazara.ai" className="hover:text-white">
                contact@nazara.ai
              </a>
            </li>
            <li>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/40">
        © {new Date().getFullYear()} Nazara AI. All rights reserved.
      </div>
    </footer>
  );
}
