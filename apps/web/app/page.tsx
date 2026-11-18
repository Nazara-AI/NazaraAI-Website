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

const EXTRACTED: { item: string; drawing: string; model: string; ok: boolean }[] = [
  { item: "Brace B-214", drawing: "Ø610×19", model: "Ø610×22", ok: false },
  { item: "Leg L-02 can", drawing: "Ø1524×50", model: "Ø1524×50", ok: true },
  { item: "Weld W-08", drawing: "CJP · —", model: "CJP · Cat. A", ok: false },
  { item: "Node N-31", drawing: "S355 NL", model: "S355 NL", ok: true },
];

const BASIS = ["API RP 2A", "ISO 19902", "NORSOK N-004", "DNV-RP-C203", "AWS D1.1", "Client spec", "Design basis"];

const STRUCTURES = ["Jackets", "Topsides", "Foundations", "Secondary steel"];

const AGENT_TRACE: { agent: string; task: string; status: "done" | "running" | "queued" }[] = [
  { agent: "extract", task: "42 sheets → 1,318 callouts", status: "done" },
  { agent: "cross-check", task: "drawings ↔ in-place model", status: "done" },
  { agent: "compliance", task: "weld & NDT vs. client spec", status: "running" },
  { agent: "draft", task: "findings with references", status: "queued" },
];

const PLATFORM_POINTS = [
  "Structured extraction, not summaries",
  "Every finding cites a sheet or model reference",
  "Engineers accept, reject or comment on each item",
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
        <section id="platform" className="blueprint relative scroll-mt-20 border-b border-line px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
              <div>
                <Eyebrow>Platform</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                  Built for the way structural work is <span className="text-brand">checked.</span>
                </h2>
              </div>
              <div>
                <p className="text-ink-soft">
                  General-purpose AI summarises documents. Nazara AI is built to verify them — with the
                  structure, references and evidence a checking engineer needs.
                </p>
                <ul className="mt-5 space-y-2">
                  {PLATFORM_POINTS.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                        <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5">
                          <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-6">
              {/* 01 — Engineering-aware checks (wide) */}
              <article className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand/40 hover:shadow-[0_16px_48px_-24px_rgba(22,101,51,0.4)] lg:col-span-4">
                <div className="grid h-full md:grid-cols-[1fr_1.15fr]">
                  <div className="flex flex-col p-6 sm:p-8">
                    <span className="font-mono text-xs text-brand">{PILLARS[0].tag}</span>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight">{PILLARS[0].title}</h3>
                    <p className="mt-3 font-medium text-ink">{PILLARS[0].lead}</p>
                    <p className="mt-2 text-sm text-ink-soft">{PILLARS[0].body}</p>
                    <div className="relative mt-6 h-36 overflow-hidden rounded-xl bg-paper ring-1 ring-line ring-inset md:mt-auto">
                      <ThreeScene variant={PILLARS[0].scene} className="absolute inset-0" />
                    </div>
                  </div>
                  <div className="flex flex-col border-t border-line bg-paper/60 p-5 sm:p-6 md:border-t-0 md:border-l">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Extracted · drawing vs. model</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Illustrative</span>
                    </div>
                    <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
                      <table className="w-full text-left text-[12px]">
                        <thead className="border-b border-line bg-paper font-mono text-[10px] uppercase tracking-wider text-muted">
                          <tr>
                            <th className="px-3 py-2 font-medium">Item</th>
                            <th className="px-3 py-2 font-medium">Drawing</th>
                            <th className="px-3 py-2 font-medium">Model</th>
                            <th className="px-2 py-2" aria-label="Status" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line font-mono">
                          {EXTRACTED.map((r) => (
                            <tr key={r.item} className={r.ok ? "" : "bg-red-50/50"}>
                              <td className="px-3 py-2.5 font-sans font-medium text-ink">{r.item}</td>
                              <td className={`px-3 py-2.5 ${r.ok ? "text-ink-soft" : "text-red-700"}`}>{r.drawing}</td>
                              <td className="px-3 py-2.5 text-ink-soft">{r.model}</td>
                              <td className="px-2 py-2.5 text-center">
                                <span
                                  className={`inline-block h-2 w-2 rounded-full ${r.ok ? "bg-brand-bright" : "bg-red-500"}`}
                                  aria-label={r.ok ? "Match" : "Mismatch"}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {[
                        ["42", "sheets read"],
                        ["1,318", "callouts"],
                        ["2", "mismatches"],
                      ].map(([v, l]) => (
                        <div key={l} className="rounded-lg border border-line bg-white px-2 py-2.5">
                          <div className="font-mono text-base font-semibold text-ink">{v}</div>
                          <div className="text-[10.5px] text-muted">{l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-brand/30 bg-brand-tint/60 px-3 py-2.5 text-[12px] text-brand md:mt-auto">
                      <Arrow />
                      <span>
                        2 findings drafted with sheet references — sent to the checker for review
                      </span>
                    </div>
                  </div>
                </div>
              </article>

              {/* 02 — Offshore context (narrow) */}
              <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 transition hover:border-brand/40 hover:shadow-[0_16px_48px_-24px_rgba(22,101,51,0.4)] sm:p-8 lg:col-span-2">
                <span className="font-mono text-xs text-brand">{PILLARS[1].tag}</span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{PILLARS[1].title}</h3>
                <p className="mt-3 font-medium text-ink">{PILLARS[1].lead}</p>
                <div className="relative -mx-2 mt-5 h-36 overflow-hidden rounded-xl bg-paper ring-1 ring-line ring-inset">
                  <ThreeScene variant={PILLARS[1].scene} className="absolute inset-0" />
                </div>
                <p className="mt-5 text-sm text-ink-soft">{PILLARS[1].body}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {STRUCTURES.map((s) => (
                    <span key={s} className="rounded-md bg-brand-tint px-2 py-1 text-[11px] font-medium text-brand">
                      {s}
                    </span>
                  ))}
                </div>
              </article>

              {/* 03 — Agentic workflows (dark) */}
              <article className="blueprint-dark flex flex-col overflow-hidden rounded-2xl border border-deep bg-deep p-6 text-white sm:p-8 lg:col-span-3">
                <span className="font-mono text-xs text-brand-bright">{PILLARS[2].tag}</span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{PILLARS[2].title}</h3>
                <p className="mt-3 font-medium text-white/90">{PILLARS[2].lead}</p>
                <p className="mt-2 text-sm text-white/60">{PILLARS[2].body}</p>
                <div className="relative -mx-2 mt-5 h-40 overflow-hidden rounded-xl bg-white/[0.03] ring-1 ring-white/10 ring-inset">
                  <ThreeScene variant={PILLARS[2].scene} tone="dark" className="absolute inset-0" />
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-deep-2/80 p-4 font-mono text-[11.5px]">
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
                    <span>run · jacket-brace-connections</span>
                    <span>illustrative</span>
                  </div>
                  <ul className="space-y-2">
                    {AGENT_TRACE.map((a) => (
                      <li key={a.agent} className="flex items-center gap-3">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            a.status === "done"
                              ? "bg-brand-bright"
                              : a.status === "running"
                                ? "animate-pulse bg-amber-400"
                                : "bg-white/25"
                          }`}
                        />
                        <span className="w-24 shrink-0 text-brand-bright">{a.agent}</span>
                        <span className="min-w-0 flex-1 truncate text-white/70">{a.task}</span>
                        <span className="shrink-0 text-white/35">{a.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* 04 — Traceable record */}
              <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 transition hover:border-brand/40 hover:shadow-[0_16px_48px_-24px_rgba(22,101,51,0.4)] sm:p-8 lg:col-span-3">
                <span className="font-mono text-xs text-brand">04</span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">Traceable by default</h3>
                <p className="mt-3 font-medium text-ink">Every finding carries its evidence and its decision.</p>
                <p className="mt-2 text-sm text-ink-soft">
                  Requirement, evidence and engineer decision stay linked, so the review becomes a QA/QC
                  record you can hand to internal review or a certifying body.
                </p>
                <div className="mt-6 rounded-xl border border-line bg-paper/60 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ring-1 ring-inset bg-red-50 text-red-700 ring-red-200">
                      High
                    </span>
                    <p className="text-[13px] leading-snug font-medium">
                      Brace B-214: drawing shows Ø610×19, model uses Ø610×22
                    </p>
                  </div>
                  <ol className="mt-4 flex flex-col gap-2 font-mono text-[11px] sm:flex-row sm:items-center sm:gap-0">
                    {[
                      ["Requirement", "Design basis §4.2"],
                      ["Evidence", "S-1203 rev C · m2141"],
                      ["Decision", "Pending engineer"],
                    ].map(([k, v], i) => (
                      <li key={k} className="flex items-center sm:flex-1">
                        <div className="min-w-0 flex-1 rounded-md border border-line bg-white px-2.5 py-1.5">
                          <div className="text-[9.5px] uppercase tracking-wider text-muted">{k}</div>
                          <div className="truncate text-ink">{v}</div>
                        </div>
                        {i < 2 && <span className="hidden px-1.5 text-muted sm:inline">→</span>}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white">Accept</span>
                    <span className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink">Reject</span>
                    <span className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft">Comment</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 font-mono text-[11px] text-muted lg:mt-auto">
                  <span className="uppercase tracking-wider">Export record</span>
                  {["PDF report", "CSV register", "Comment sheet"].map((x) => (
                    <span key={x} className="rounded border border-line bg-white px-2 py-0.5 text-ink-soft">
                      {x}
                    </span>
                  ))}
                </div>
              </article>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Framed around</span>
              <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-ink-soft">
                {BASIS.map((b) => (
                  <span key={b}>{b}</span>
                ))}
              </div>
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
