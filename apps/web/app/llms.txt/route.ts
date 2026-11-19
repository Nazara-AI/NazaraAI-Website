import { FAQ, SITE, SITE_URL } from "../site";
import { USE_CASES } from "../use-cases/data";

/** llms.txt — a plain-markdown brief for LLM-based answer engines (https://llmstxt.org). */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE.name}

> ${SITE.definition}

${SITE.name} is in an early access program for offshore structural engineering teams. Engineers lead, verify and approve every decision; the AI drafts findings, it does not sign off.

## What it does

- Reads drawing sets, calculation reports and structural analysis output, extracting members, sections, connections, weld and NDT/inspection callouts into structured data.
- Cross-checks drawings against each other and against the in-place analysis model (member sizes, node geometry, joint details, revisions not carried through).
- Checks calculation inputs (loads, material properties, factors) against the project design basis and re-runs routine member and connection checks.
- Reviews packages against client specifications, project requirements and design codes such as API RP 2A, ISO 19902, NORSOK N-004, DNV-RP-C203 and AWS D1.1.
- Produces a traceable QA/QC record: each finding links requirement, evidence (sheet or model reference) and the engineer's decision.

## How it works

1. Upload the package — drawing sets, calculation reports and analysis output.
2. Agents run the review — consistency, completeness and compliance checks across the whole set, not a sample.
3. Engineers decide — the checker accepts, rejects or comments on each finding, then exports the record.

## Built for

- Structures: offshore jackets, topsides, foundations and secondary steel.
- Teams: engineering and design offices, fabrication yards, owners and operators, verification and certifying bodies.

## Use cases

${USE_CASES.map((u) => `- [${u.h1}](${SITE_URL}/use-cases/${u.slug}): ${u.description}`).join("\n")}

## FAQ

${FAQ.map(({ q, a }) => `### ${q}\n\n${a}`).join("\n\n")}

## Links

- [Home](${SITE_URL}/): overview, use cases and early access sign-up
- [Use cases](${SITE_URL}/use-cases): all review passes, one page each
- [Early access](${SITE_URL}/#early-access): apply to pilot ${SITE.name} on a live package
- Contact: ${SITE.email}
- LinkedIn: ${SITE.linkedin}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
