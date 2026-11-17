"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { ThreeScene, type SceneVariant } from "./components/three-scene";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: "#platform", label: "Platform" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#faq", label: "FAQ" },
];

type Severity = "High" | "Medium" | "Low";

const DEMO_STEPS = [
  "Read the drawing set — 42 sheets, 6 revisions",
  "Extract members, sections, weld and NDT callouts",
  "Cross-check against the in-place analysis output",
  "Draft findings with sheet and model references",
];

const DEMO_FINDINGS: { severity: Severity; title: string; ref: string }[] = [
  {
    severity: "High",
    title: "Brace B-214: drawing shows Ø610×19, model uses Ø610×22",
    ref: "DWG S-1203 rev C · model member 2141",
  },
  {
    severity: "Medium",
    title: "Node N-31: can thickness not stated on detail 7",
    ref: "DWG S-1210 rev B",
  },
  {
    severity: "Low",
    title: "Weld W-08: inspection category missing from general notes",
    ref: "DWG S-1001 rev D",
  },
];

const SEVERITY_STYLE: Record<Severity, string> = {
  High: "bg-red-50 text-red-700 ring-red-200",
  Medium: "bg-amber-50 text-amber-800 ring-amber-200",
  Low: "bg-slate-100 text-slate-700 ring-slate-200",
};

const PILLARS: { tag: string; scene: SceneVariant; title: string; lead: string; body: string }[] = [
  {
    tag: "01",
    scene: "sheet",
    title: "Engineering-aware checks",
    lead: "Reads drawings, calculations and model output the way a checker does.",
    body: "Members, sections, connections, weld and inspection callouts are pulled into structured data, so checks run against what the drawing actually says.",
  },
  {
    tag: "02",
    scene: "joint",
    title: "Offshore structural context",
    lead: "Built for jackets, topsides, foundations and their secondary steel.",
    body: "Checks are framed around the codes, client specifications and project design basis your work is reviewed against.",
  },
  {
    tag: "03",
    scene: "network",
    title: "Agentic review workflows",
    lead: "AI agents carry out the repetitive review passes end to end.",
    body: "They cross-reference the set, trace every finding back to a sheet or model reference, and hand the engineer a list to accept or reject.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Upload the package",
    body: "Drawing sets, calculation reports and analysis output from the project you want reviewed.",
  },
  {
    n: "02",
    title: "Agents run the review",
    body: "Consistency, completeness and compliance checks run across the whole set, not a sample of it.",
  },
  {
    n: "03",
    title: "Engineers decide",
    body: "Every finding comes with its evidence. Your checker accepts, rejects or comments, then exports the record.",
  },
];

const USE_CASES = [
  {
    id: "drawings",
    label: "Drawing review",
    pipeline: ["General arrangement", "Detail drawings", "Fabrication drawings"],
    cards: [
      {
        title: "Catch inconsistencies across the drawing set before issue.",
        body: "Sections, dimensions and references are compared sheet to sheet, so a change on one drawing is checked everywhere it appears.",
      },
      {
        title: "Spot missing information on details and notes.",
        body: "Weld sizes, inspection categories, material grades and tolerances are checked for presence, not just correctness.",
      },
    ],
  },
  {
    id: "calcs",
    label: "Calculation checks",
    pipeline: ["Design basis", "Hand calculations", "Calculation reports"],
    cards: [
      {
        title: "Check calculation inputs against the design basis.",
        body: "Loads, material properties and factors used in a calculation are compared to the values the project agreed on.",
      },
      {
        title: "Re-run routine checks independently.",
        body: "Standard member and connection checks are recomputed, so a checker reviews differences rather than every line.",
      },
    ],
  },
  {
    id: "model",
    label: "Model ↔ drawing",
    pipeline: ["Analysis model", "Member schedule", "Issued drawings"],
    cards: [
      {
        title: "Keep the analysis model and the drawings in step.",
        body: "Member sizes, node geometry and joint details in the model are compared with what was drawn and issued.",
      },
      {
        title: "Flag revisions that were never carried through.",
        body: "When the model changes late in design, see which drawings still show the old member or connection.",
      },
    ],
  },
  {
    id: "compliance",
    label: "Code & spec compliance",
    pipeline: ["Client specification", "Project design basis", "Design codes"],
    cards: [
      {
        title: "Review against the requirements that govern the job.",
        body: "Client specs and project requirements become a checklist the agent works through on every package.",
      },
      {
        title: "Turn findings into a traceable QA/QC record.",
        body: "Each item links requirement, evidence and engineer decision, ready for internal review or the certifying body.",
      },
    ],
  },
];

const COMPARE = [
  ["Sampled spot checks on large drawing sets", "Every sheet and every callout reviewed"],
  ["Model and drawing mismatches found late", "Mismatches flagged as soon as the package lands"],
  ["Findings scattered across emails and mark-ups", "One list, each finding linked to its evidence"],
  ["Senior engineers on repetitive checking", "Senior engineers on the judgement calls"],
];

const AUDIENCE = [
  "Engineering & design offices",
  "Fabrication yards",
  "Owners & operators",
  "Verification & certifying bodies",
];

const FAQ = [
  {
    q: "Does Nazara AI replace the checking engineer?",
    a: "No. Agents do the repetitive review passes and draft findings with evidence. A qualified engineer reviews, accepts or rejects every finding, and owns the sign-off.",
  },
  {
    q: "What kinds of files does it work with?",
    a: "The early access program focuses on drawing sets (PDF), calculation reports and structural analysis output. Tell us what your workflow uses when you apply and we'll confirm fit.",
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

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`font-mono text-xs font-medium uppercase tracking-[0.14em] ${
        dark ? "text-brand-bright" : "text-brand"
      }`}
    >
      {children}
    </p>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 shrink-0">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReviewPanel() {
  return (
    <div className="relative rounded-2xl border border-line bg-white shadow-[0_24px_60px_-24px_rgba(12,26,19,0.25)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-bright" />
          <span className="font-mono text-xs text-muted">review · jacket-brace-connections</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Illustrative</span>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="reveal rounded-lg bg-paper px-3.5 py-3 text-sm text-ink-soft" style={{ animationDelay: "0.1s" }}>
          <span className="font-mono text-xs text-muted">Engineer →</span>
          <p className="mt-1">
            “Check the brace connection drawings against the in-place analysis and flag anything that
            doesn’t match. Don’t change anything — show me the list.”
          </p>
        </div>

        <ol className="space-y-2">
          {DEMO_STEPS.map((s, i) => (
            <li
              key={s}
              className="reveal flex items-start gap-3 text-sm"
              style={{ animationDelay: `${0.4 + i * 0.25}s` }}
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint font-mono text-[10px] font-medium text-brand">
                ✓
              </span>
              <span className="text-ink-soft">{s}</span>
            </li>
          ))}
        </ol>

        <div className="reveal rounded-lg border border-line" style={{ animationDelay: "1.5s" }}>
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2">
            <span className="text-xs font-semibold">Findings</span>
            <span className="font-mono text-[10px] text-muted">3 open · awaiting engineer</span>
          </div>
          <ul className="divide-y divide-line">
            {DEMO_FINDINGS.map((f) => (
              <li key={f.title} className="flex items-start gap-3 px-3.5 py-2.5">
                <span
                  className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ring-1 ring-inset ${SEVERITY_STYLE[f.severity]}`}
                >
                  {f.severity}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug font-medium">{f.title}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted">{f.ref}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCase, setActiveCase] = useState(USE_CASES[0].id);

  // Scroll to in-page sections without adding "#section" to the URL.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href")!.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (id && !target) return;
      e.preventDefault();
      if (target) target.scrollIntoView();
      else window.scrollTo({ top: 0 });
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, company, email }),
      });
      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const current = USE_CASES.find((u) => u.id === activeCase) ?? USE_CASES[0];
  const inputClass =
    "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Announcement */}
      <div className="bg-deep px-4 py-2 text-center text-xs text-white/80 sm:text-[13px]">
        <span className="font-mono text-brand-bright">Early Access</span>
        <span className="mx-2 text-white/30">/</span>
        Now enrolling offshore engineering teams for pilot reviews.{" "}
        <a href="#early-access" className="font-medium text-white underline-offset-4 hover:underline">
          Apply →
        </a>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={160} height={160} className="h-9 w-9" priority />
            <span className="text-[17px] font-bold tracking-tight">Nazara AI</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href="#early-access"
            className="shrink-0 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand sm:text-sm"
          >
            Request early access
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="blueprint relative overflow-hidden border-b border-line">
          <ThreeScene
            variant="waves"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-64 [mask-image:linear-gradient(to_top,black_30%,transparent)] sm:h-80"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <Eyebrow>AI for offshore structural design</Eyebrow>
              <h1 className="mt-5 text-[2.35rem] leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-[3.6rem]">
                QA/QC that reads the drawings
                <span className="text-brand"> before your checker has to.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-ink-soft sm:text-lg">
                Nazara AI runs engineering-aware review agents across your drawings, calculations and
                analysis output — and hands your engineers a traceable list of findings to approve.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#early-access"
                  className="rounded-lg bg-brand px-6 py-3 text-center font-semibold text-white transition hover:bg-brand-dark"
                >
                  Request early access
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-lg border border-line bg-white px-6 py-3 text-center font-semibold text-ink transition hover:border-ink/30"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
                <span>01 Upload</span>
                <span className="text-line">—</span>
                <span>02 Review</span>
                <span className="text-line">—</span>
                <span>03 Approve</span>
              </div>
            </div>
            <ReviewPanel />
          </div>
        </section>

        {/* Tagline band */}
        <section className="border-b border-line bg-white">
          <p className="mx-auto max-w-6xl px-4 py-7 text-center text-lg font-semibold tracking-tight sm:px-6 sm:text-2xl">
            AI-assisted. <span className="text-muted">Engineer-led.</span>{" "}
            <span className="text-brand">Engineer-approved.</span>
          </p>
        </section>

        {/* Pillars */}
        <section id="platform" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <Eyebrow>Platform</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for the way structural work is checked.
              </h2>
              <p className="mt-4 text-ink-soft">
                General-purpose AI summarises documents. Nazara AI is built to verify them — with the
                structure, references and evidence a checking engineer needs.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {PILLARS.map((p) => (
                <article
                  key={p.title}
                  className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-brand/40 hover:shadow-[0_12px_40px_-20px_rgba(22,101,51,0.35)] sm:p-7"
                >
                  <div className="relative -mx-2 -mt-2 h-40 overflow-hidden rounded-xl bg-paper ring-1 ring-line ring-inset">
                    <ThreeScene variant={p.scene} className="absolute inset-0" />
                    <span className="absolute top-3 left-3 font-mono text-xs text-brand">{p.tag}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-3 font-medium text-ink">{p.lead}</p>
                  <p className="mt-2 text-sm text-ink-soft">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works (dark) */}
        <section id="how-it-works" className="blueprint-dark scroll-mt-20 bg-deep px-4 py-20 text-white sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-6 lg:grid-cols-2">
              <div className="max-w-xl">
                <Eyebrow dark>How it works</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  From issued package to reviewed record.
                </h2>
                <p className="mt-4 text-white/65">
                  Agents do the passes that take days by hand. Engineers keep every decision.
                </p>
                <div className="mt-8 flex items-center gap-3 font-mono text-xs text-white/50">
                  <span className="h-px w-8 bg-brand-bright" />
                  Every member checked, level by level
                </div>
              </div>
              <ThreeScene variant="jacket" tone="dark" className="relative h-80 sm:h-[28rem] lg:h-[32rem]" />
            </div>
            <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="bg-deep-2 p-6 sm:p-8">
                  <span className="font-mono text-sm text-brand-bright">{s.n}</span>
                  <h3 className="mt-8 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-3 text-sm text-white/65">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <Eyebrow>Use cases</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Structural QA/QC in practice.
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Use cases"
              className="mt-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
            >
              {USE_CASES.map((u) => {
                const active = u.id === activeCase;
                return (
                  <button
                    key={u.id}
                    type="button"
                    role="tab"
                    id={`tab-${u.id}`}
                    aria-selected={active}
                    aria-controls={`panel-${u.id}`}
                    onClick={() => setActiveCase(u.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white text-ink-soft hover:border-ink/30 hover:text-ink"
                    }`}
                  >
                    {u.label}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`panel-${current.id}`}
              aria-labelledby={`tab-${current.id}`}
              className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
                {current.pipeline.map((stage, i) => (
                  <span key={stage} className="flex items-center gap-2">
                    <span className="rounded-md bg-paper px-2.5 py-1 text-ink-soft ring-1 ring-line ring-inset">
                      {stage}
                    </span>
                    {i < current.pipeline.length - 1 && <Arrow />}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
                {current.cards.map((c) => (
                  <div key={c.title} className="border-l-2 border-brand pl-5">
                    <h3 className="text-lg leading-snug font-semibold tracking-tight">{c.title}</h3>
                    <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Before / after */}
        <section className="border-y border-line bg-white px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <Eyebrow>Why Nazara AI</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Less time checking. More time engineering.
              </h2>
            </div>
            <div className="mt-12 overflow-hidden rounded-2xl border border-line">
              <div className="grid grid-cols-2 bg-paper text-xs font-semibold tracking-wide uppercase sm:text-sm">
                <div className="px-4 py-3 text-muted sm:px-6">Manual QA/QC today</div>
                <div className="border-l border-line px-4 py-3 text-brand sm:px-6">With Nazara AI</div>
              </div>
              {COMPARE.map(([before, after]) => (
                <div key={before} className="grid grid-cols-2 border-t border-line text-sm">
                  <div className="px-4 py-4 text-ink-soft sm:px-6">{before}</div>
                  <div className="border-l border-line px-4 py-4 font-medium sm:px-6">{after}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Questions engineers ask.</h2>
              <p className="mt-4 text-ink-soft">
                Something else?{" "}
                <a href="mailto:contact@nazara.ai" className="font-medium text-brand underline-offset-4 hover:underline">
                  contact@nazara.ai
                </a>
              </p>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer items-start justify-between gap-6 font-semibold">
                    {f.q}
                    <span className="mt-1 font-mono text-brand transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 pr-8 text-sm text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Early access */}
        <section id="early-access" className="blueprint-dark scroll-mt-20 bg-deep px-4 py-20 text-white sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow dark>Early access program</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                From issued drawings to reviewed designs.
              </h2>
              <p className="mt-5 max-w-lg text-white/70">
                Join the teams piloting Nazara AI on live offshore packages. Early partners shape the
                checks we build next.
              </p>
              <p className="mt-10 font-mono text-xs tracking-wider text-white/50 uppercase">Built for</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {AUDIENCE.map((a) => (
                  <li key={a} className="flex items-center gap-2.5 text-sm text-white/85">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {submitted ? (
              <div className="rounded-2xl bg-white p-8 text-center text-ink">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-xl text-brand">
                  ✓
                </div>
                <p className="mt-4 text-lg font-semibold">You&apos;re on the list.</p>
                <p className="mt-2 text-ink-soft">Thanks for signing up — we&apos;ll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 text-ink sm:p-8">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="company" className="text-sm font-medium">
                    Company <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Join Waitlist / Request Early Access"}
                </button>
                <p className="text-center text-xs text-muted">We&apos;ll only use your details to contact you about early access.</p>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-deep px-4 py-12 text-white/60 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
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
          <div>
            <p className="font-mono text-xs tracking-wider text-white/40 uppercase">Product</p>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="hover:text-white">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
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
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Nazara AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
