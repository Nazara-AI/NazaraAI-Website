import type { Metadata } from "next";
import Link from "next/link";
import { EarlyAccess } from "../components/early-access";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { Arrow, Eyebrow } from "../components/ui";
import { SITE_URL, breadcrumbs, jsonLd, pageMetadata } from "../site";
import { USE_CASES } from "./data";

const TITLE = "Offshore Structural QA/QC Use Cases";
const DESCRIPTION =
  "How Nazara AI is used on offshore structural packages: drawing review, calculation checking, model-to-drawing comparison and code and specification compliance.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/use-cases" });

export default function UseCasesPage() {
  const url = `${SITE_URL}/use-cases`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: USE_CASES.map((u, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: u.h1,
            url: `${SITE_URL}/use-cases/${u.slug}`,
          })),
        },
      },
      {
        "@id": `${url}#breadcrumb`,
        ...breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Use cases", path: "/use-cases" },
        ]),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <SiteHeader />

      <main className="flex-1">
        <section className="blueprint border-b border-line px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link href="/" className="hover:text-ink">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-ink-soft">Use cases</li>
              </ol>
            </nav>
            <div className="mt-10 max-w-3xl">
              <Eyebrow>Use cases</Eyebrow>
              <h1 className="mt-4 text-[2.1rem] leading-[1.1] font-extrabold tracking-tight sm:text-5xl">
                Offshore structural QA/QC use cases
              </h1>
              <p className="mt-6 text-base text-ink-soft sm:text-lg">
                Nazara AI runs review agents across offshore structural packages for jackets, topsides,
                foundations and secondary steel. These are the four review passes it carries out — each
                one producing evidence-linked findings that a checking engineer accepts or rejects.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <ul className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            {USE_CASES.map((u) => (
              <li key={u.slug}>
                <Link
                  href={`/use-cases/${u.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-brand/40 hover:shadow-[0_16px_48px_-24px_rgba(22,101,51,0.4)] sm:p-8"
                >
                  <h2 className="text-xl font-bold tracking-tight">{u.h1}</h2>
                  <p className="mt-3 text-sm text-ink-soft">{u.description}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {u.pipeline.map((p) => (
                      <span key={p} className="rounded-md bg-brand-tint px-2 py-1 text-[11px] font-medium text-brand">
                        {p}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                    Read more <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <EarlyAccess />
      </main>

      <SiteFooter />
    </div>
  );
}
