/**
 * Single source of truth for site identity and the copy that search engines and
 * answer engines read (metadata, JSON-LD, llms.txt and the on-page FAQ).
 */

/** Canonical origin. Override per environment with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nazara.ai").replace(/\/+$/, "");

export const SITE = {
  name: "Nazara AI",
  title: "Nazara AI — AI QA/QC for Offshore Structural Engineering",
  shortTitle: "AI QA/QC for offshore structural engineering",
  description:
    "AI review agents that check offshore structural drawings, calculations and analysis models — and give engineers a traceable list of findings to approve.",
  /** One-sentence definition, written to be quoted verbatim by answer engines. */
  definition:
    "Nazara AI is an AI-assisted QA/QC platform for offshore structural engineering that checks drawing sets, calculation reports and analysis models for inconsistencies, missing information and code or specification non-compliance, then hands a qualified engineer a list of evidence-linked findings to accept or reject.",
  email: "contact@nazara.ai",
  linkedin: "https://www.linkedin.com/company/nazara-inc/",
  locale: "en_US",
  keywords: [
    "offshore structural engineering",
    "structural QA/QC",
    "AI drawing review",
    "engineering drawing checking",
    "structural calculation checking",
    "jacket structure design",
    "topsides design",
    "offshore foundations",
    "model to drawing comparison",
    "API RP 2A",
    "ISO 19902",
    "NORSOK N-004",
    "DNV-RP-C203",
    "AWS D1.1",
    "AI agents for engineering",
  ],
} as const;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is Nazara AI?",
    a: SITE.definition,
  },
  {
    q: "Does Nazara AI replace the checking engineer?",
    a: "No. Agents do the repetitive review passes and draft findings with evidence. A qualified engineer reviews, accepts or rejects every finding, and owns the sign-off.",
  },
  {
    q: "Which structures and standards is it built for?",
    a: "Offshore jackets, topsides, foundations and their secondary steel. Checks are framed around the codes and documents the work is reviewed against, such as API RP 2A, ISO 19902, NORSOK N-004, DNV-RP-C203 and AWS D1.1, plus the client specification and project design basis.",
  },
  {
    q: "What kinds of files does it work with?",
    a: "The early access program focuses on drawing sets (PDF), calculation reports and structural analysis output. Tell us what your workflow uses when you apply and we'll confirm fit.",
  },
  {
    q: "Who is Nazara AI for?",
    a: "Engineering and design offices, fabrication yards, owners and operators, and verification and certifying bodies that review offshore structural packages.",
  },
  {
    q: "How is project data handled?",
    a: "Project data handling, including where files are stored and processed, is agreed with each early access partner before any files are shared.",
  },
  {
    q: "What does joining early access involve?",
    a: "A short call to understand your QA/QC process, then a pilot on a package you choose. Early partners help shape which checks we build next.",
  },
];

/** Escape for safe embedding inside a <script type="application/ld+json">. */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function structuredData() {
  const org = `${SITE_URL}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: SITE.name,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        email: SITE.email,
        sameAs: [SITE.linkedin],
        description: SITE.definition,
        contactPoint: { "@type": "ContactPoint", email: SITE.email, contactType: "sales" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "en",
        publisher: { "@id": org },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE.name,
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Engineering QA/QC",
        operatingSystem: "Web",
        description: SITE.definition,
        publisher: { "@id": org },
        audience: {
          "@type": "BusinessAudience",
          audienceType: "Offshore structural engineering teams",
        },
        featureList: [
          "Structured extraction of members, sections, weld and NDT callouts from drawings",
          "Cross-checks between drawings and the in-place analysis model",
          "Calculation input checks against the project design basis",
          "Code and client specification compliance review",
          "Evidence-linked findings that engineers accept, reject or comment on",
          "Exportable, traceable QA/QC record",
        ],
      },
    ],
  };
}

export function faqPage(faq: { q: string; a: string }[], path: string) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${path === "/" ? "/" : path}#faq`,
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Per-page metadata with canonical URL and full Open Graph / Twitter fields. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }) {
  // A page-level openGraph object replaces the root one, so the shared card is restated here.
  const images = [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.title }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
      images,
    },
    twitter: { card: "summary_large_image" as const, title, description, images },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === "/" ? "" : it.path}`,
    })),
  };
}
