import Link from "next/link";
import { ThreeScene } from "./components/three-scene";
import { EarlyAccess } from "./components/early-access";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { Arrow, Eyebrow } from "./components/ui";
import { UseCaseTabs } from "./components/use-case-tabs";
import { FAQ, SITE, SITE_URL, faqPage, jsonLd } from "./site";
import { USE_CASES } from "./use-cases/data";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

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

const PILLARS: { tag: string; title: string; lead: string; body: string }[] = [
  {
    tag: "01",
    title: "Engineering-aware checks",
    lead: "Reads drawings, calculations and model output the way a checker does.",
    body: "Members, sections, connections, weld and inspection callouts are pulled into structured data, so checks run against what the drawing actually says.",
  },
  {
    tag: "02",
    title: "Offshore structural context",
    lead: "Built for jackets, topsides, foundations and their secondary steel.",
    body: "Checks are framed around the codes, client specifications and project design basis your work is reviewed against.",
  },
  {
    tag: "03",
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

const COMPARE = [
  ["Sampled spot checks on large drawing sets", "Every sheet and every callout reviewed"],
  ["Model and drawing mismatches found late", "Mismatches flagged as soon as the package lands"],
  ["Findings scattered across emails and mark-ups", "One list, each finding linked to its evidence"],
  ["Senior engineers on repetitive checking", "Senior engineers on the judgement calls"],
];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

type FlowIcon = "file" | "bot" | "check" | "flag";

const FLOW: { icon: FlowIcon; label: string; meta: string; tone?: "agent" | "flag" }[] = [
  { icon: "file", label: "Drawings", meta: "42 sheets" },
  { icon: "bot", label: "Agents", meta: "3 running", tone: "agent" },
  { icon: "check", label: "Checks", meta: "1,318 run" },
  { icon: "flag", label: "Findings", meta: "2 flagged", tone: "flag" },
];

function Icon({ name, className = "h-5 w-5" }: { name: FlowIcon; className?: string }) {
  const paths: Record<FlowIcon, React.ReactNode> = {
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </>
    ),
    bot: (
      <>
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </>
    ),
    flag: (
      <>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <path d="M4 22v-7" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function AgentFlow() {
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-5 sm:px-5">
      <ol className="flex items-start" aria-label="Review flow: drawings, agents, checks, findings">
        {FLOW.map((n, i) => (
          <li key={n.label} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-16 shrink-0 flex-col items-center text-center sm:w-20">
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset sm:h-12 sm:w-12 ${
                  n.tone === "flag"
                    ? "bg-amber-400/10 text-amber-400 ring-amber-400/30"
                    : n.tone === "agent"
                      ? "bg-brand-bright/15 text-brand-bright ring-brand-bright/40"
                      : "bg-white/5 text-white/80 ring-white/15"
                }`}
              >
                {n.tone === "agent" && (
                  <span className="flow-ping absolute inset-0 rounded-xl ring-1 ring-brand-bright/50" />
                )}
                <Icon name={n.icon} />
              </span>
              <span className="mt-2 text-[12px] font-semibold text-white">{n.label}</span>
              <span
                className={`font-mono text-[10px] ${n.tone === "flag" ? "text-amber-400/80" : "text-white/45"}`}
              >
                {n.meta}
              </span>
            </div>
            {i < FLOW.length - 1 && (
              <div className="relative mt-[22px] h-px flex-1 bg-white/15 sm:mt-6" aria-hidden="true">
                <span
                  className={`flow-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${
                    i === FLOW.length - 2 ? "bg-amber-400" : "bg-brand-bright"
                  }`}
                  style={{ animationDelay: `${i * 0.6}s` }}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
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

const PAGE_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: SITE.title,
      description: SITE.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#software` },
      inLanguage: "en",
    },
    faqPage(FAQ, "/"),
  ],
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(PAGE_LD) }} />
      <SiteHeader home />

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
                      <ThreeScene variant="sheet" className="absolute inset-0" />
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
                  <ThreeScene variant="joint" className="absolute inset-0" />
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
                <AgentFlow />
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
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgb(34_197_94/0.12),transparent)]"
                />
                <ThreeScene variant="jacket" tone="dark" className="relative h-80 sm:h-[28rem] lg:h-[32rem]" />
              </div>
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

            <UseCaseTabs
              tabs={USE_CASES.map(({ slug, label, pipeline, cards }) => ({ slug, label, pipeline, cards }))}
            />
            <Link
              href="/use-cases"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              All use cases <Arrow />
            </Link>
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

        <EarlyAccess />
      </main>

      <SiteFooter />
    </div>
  );
}
