import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EarlyAccess } from "../../components/early-access";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { Arrow, Eyebrow } from "../../components/ui";
import { SITE_URL, breadcrumbs, faqPage, jsonLd, pageMetadata } from "../../site";
import { USE_CASES, getUseCase } from "../data";

export const dynamicParams = false;

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: PageProps<"/use-cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) return {};
  return pageMetadata({ title: u.title, description: u.description, path: `/use-cases/${u.slug}` });
}

export default async function UseCasePage({ params }: PageProps<"/use-cases/[slug]">) {
  const { slug } = await params;
  const u = getUseCase(slug);
  if (!u) notFound();

  const path = `/use-cases/${u.slug}`;
  const url = `${SITE_URL}${path}`;
  const others = USE_CASES.filter((o) => o.slug !== u.slug);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: u.title,
        description: u.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#software` },
        inLanguage: "en",
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@id": `${url}#breadcrumb`,
        ...breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Use cases", path: "/use-cases" },
          { name: u.label, path },
        ]),
      },
      faqPage(u.faq, path),
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
                <li><Link href="/use-cases" className="hover:text-ink">Use cases</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-ink-soft">{u.label}</li>
              </ol>
            </nav>
            <div className="mt-10 max-w-3xl">
              <Eyebrow>Use case</Eyebrow>
              <h1 className="mt-4 text-[2.1rem] leading-[1.1] font-extrabold tracking-tight sm:text-5xl">{u.h1}</h1>
              <p className="mt-6 text-base text-ink-soft sm:text-lg">{u.answer}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#early-access"
                  className="rounded-lg bg-brand px-6 py-3 text-center font-semibold text-white transition hover:bg-brand-dark"
                >
                  Request early access
                </a>
                <a
                  href="#what-it-checks"
                  className="rounded-lg border border-line bg-white px-6 py-3 text-center font-semibold text-ink transition hover:border-ink/30"
                >
                  What it checks
                </a>
              </div>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
              {u.pipeline.map((stage, i) => (
                <span key={stage} className="flex items-center gap-2">
                  <span className="rounded-md bg-white px-2.5 py-1 text-ink-soft ring-1 ring-line ring-inset">{stage}</span>
                  {i < u.pipeline.length - 1 && <Arrow />}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{u.problem.heading}</h2>
            <div className="space-y-5 text-ink-soft">
              {u.problem.body.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="what-it-checks" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{u.checks.heading}</h2>
            <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
              {u.checks.items.map((c) => (
                <div key={c.term} className="bg-white p-6 sm:p-8">
                  <dt className="font-semibold">{c.term}</dt>
                  <dd className="mt-2 text-sm text-ink-soft">{c.detail}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-14 grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-bold tracking-tight">What you upload</h2>
                <ul className="mt-4 space-y-2 text-ink-soft">
                  {u.inputs.map((i) => (
                    <li key={i} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">What you get back</h2>
                <ul className="mt-4 space-y-2 text-ink-soft">
                  {u.output.map((o) => (
                    <li key={o} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-12 rounded-xl border border-dashed border-brand/30 bg-brand-tint/60 px-5 py-4 text-sm text-brand">
              AI-assisted, engineer-led: agents draft findings with evidence — a qualified engineer accepts or
              rejects every one and owns the sign-off.
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 border-t border-line bg-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{u.label}: common questions</h2>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {u.faq.map((f) => (
                <div key={f.q} className="py-6">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold tracking-tight">Related use cases</h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/use-cases/${o.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-brand/40"
                  >
                    <span className="font-semibold">{o.h1}</span>
                    <span className="mt-2 text-sm text-ink-soft">{o.description}</span>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                      Read more <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <EarlyAccess heading={`Pilot ${u.label.toLowerCase()} on a live package.`} />
      </main>

      <SiteFooter />
    </div>
  );
}
