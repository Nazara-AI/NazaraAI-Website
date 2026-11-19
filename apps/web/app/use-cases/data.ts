/**
 * Use-case content. Drives the homepage tabs, the /use-cases hub, each
 * /use-cases/[slug] page, the sitemap, JSON-LD and llms.txt.
 */

export type UseCase = {
  slug: string;
  /** Short tab label on the homepage. */
  label: string;
  /** <title> and H1 — phrased the way engineers search. */
  title: string;
  h1: string;
  /** Meta description, ~150 characters. */
  description: string;
  /** Answer-first opening paragraph: the passage answer engines should quote. */
  answer: string;
  pipeline: string[];
  /** Two summary cards shown on the homepage tab. */
  cards: { title: string; body: string }[];
  problem: { heading: string; body: string[] };
  checks: { heading: string; items: { term: string; detail: string }[] };
  inputs: string[];
  output: string[];
  faq: { q: string; a: string }[];
};

export const USE_CASES: UseCase[] = [
  {
    slug: "drawing-review",
    label: "Drawing review",
    title: "AI Drawing Review for Offshore Structural Drawings",
    h1: "AI drawing review for offshore structural drawing sets",
    description:
      "Check every sheet of an offshore structural drawing set for inconsistencies and missing information — sections, dimensions, weld and inspection callouts — before issue.",
    answer:
      "AI drawing review with Nazara AI reads every sheet of an offshore structural drawing set — general arrangements, detail drawings and fabrication drawings — extracts members, sections, dimensions, weld and inspection callouts into structured data, and flags inconsistencies between sheets and missing information on details and notes. Each finding cites the sheet and revision it came from, and a checking engineer accepts or rejects it.",
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
    problem: {
      heading: "Why drawing checks miss things",
      body: [
        "A jacket or topsides package can run to hundreds of sheets across several revisions. The same brace, node or plate appears on the general arrangement, on one or more detail drawings and again on fabrication drawings — and every one of those occurrences has to agree.",
        "Manual checking on sets that size usually means sampling. A change made late on one sheet is easy to miss on another, and missing callouts — a weld size, an inspection category, a material grade — are harder to spot than wrong ones, because there is nothing on the sheet to catch the eye.",
      ],
    },
    checks: {
      heading: "What the drawing review checks",
      items: [
        { term: "Cross-sheet consistency", detail: "Member sizes, sections, plate thicknesses and dimensions compared wherever the same item appears in the set." },
        { term: "References and call-outs", detail: "Detail, section and sheet references resolved, so a pointer to a detail that does not exist or was renumbered is flagged." },
        { term: "Weld and NDT information", detail: "Weld types and sizes and inspection categories checked for presence on every detail that needs them." },
        { term: "Materials and tolerances", detail: "Material grades and tolerance notes checked against general notes and the project's stated requirements." },
        { term: "Revision carry-through", detail: "Changes on one revision traced to the other sheets that show the same item." },
      ],
    },
    inputs: ["Issued or for-check drawing sets (PDF)", "General notes and drawing registers", "Previous revisions, where available"],
    output: [
      "A list of findings, each with severity, sheet number and revision",
      "Extracted member, section and callout data the checks ran against",
      "Engineer decisions — accepted, rejected or commented — recorded per finding",
    ],
    faq: [
      {
        q: "Can AI check structural engineering drawings?",
        a: "Yes, for the repetitive parts of the check. Nazara AI extracts members, sections, dimensions and weld and inspection callouts from offshore structural drawings and compares them across the set. Engineering judgement and sign-off stay with the checking engineer, who reviews every finding.",
      },
      {
        q: "Does it check every sheet or a sample?",
        a: "Every sheet in the package that is uploaded. Cross-sheet checks run across the whole set rather than a sample, which is where late, one-sheet changes are usually caught.",
      },
      {
        q: "Does it mark up or change the drawings?",
        a: "No. It produces a list of findings that reference the sheet and revision. Drawings are only changed by your team, after an engineer has accepted a finding.",
      },
    ],
  },
  {
    slug: "calculation-checks",
    label: "Calculation checks",
    title: "Structural Calculation Checking with AI",
    h1: "Structural calculation checking for offshore design",
    description:
      "Check structural calculation inputs against the project design basis and independently re-run routine member and connection checks, with every difference traced.",
    answer:
      "Structural calculation checking with Nazara AI compares the inputs used in hand calculations and calculation reports — loads, material properties and factors — against the values agreed in the project design basis, and independently re-runs routine member and connection checks. The checking engineer reviews the differences instead of re-deriving every line.",
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
    problem: {
      heading: "Why calculation checking takes so long",
      body: [
        "Most calculation errors are not in the method — they are in the inputs. A superseded load, a yield strength for the wrong thickness range or a factor from a different code edition can sit inside an otherwise correct calculation.",
        "Finding them means reading each calculation against the design basis line by line, then repeating routine member and connection checks by hand. That is slow, and it uses senior time on arithmetic rather than judgement.",
      ],
    },
    checks: {
      heading: "What the calculation check covers",
      items: [
        { term: "Inputs vs design basis", detail: "Loads, load factors, material properties and resistance factors compared to the values the project design basis specifies." },
        { term: "Units and consistency", detail: "The same quantity used consistently throughout a calculation and across related calculations." },
        { term: "Independent re-computation", detail: "Routine member and connection checks recomputed so results can be compared with the calculation report." },
        { term: "Traceability", detail: "Each input traced back to the clause or table it should come from in the design basis." },
      ],
    },
    inputs: ["Project design basis", "Hand calculations and calculation reports", "Relevant client specifications"],
    output: [
      "Input mismatches with the design-basis value and where it was used",
      "Recomputed results alongside the reported values, with differences flagged",
      "A record of each engineer decision on each finding",
    ],
    faq: [
      {
        q: "Does Nazara AI replace calculation checking by an engineer?",
        a: "No. It does the comparison and re-computation passes and presents differences with evidence. A qualified engineer decides whether each difference is an error and owns the check.",
      },
      {
        q: "What is checked against the design basis?",
        a: "The inputs a calculation depends on — loads and load factors, material properties and resistance factors — are compared with the values the project agreed in its design basis.",
      },
      {
        q: "Which calculations can be re-run?",
        a: "Routine, standard member and connection checks. Tell us which checks your packages rely on when you apply for early access and we will confirm fit.",
      },
    ],
  },
  {
    slug: "model-drawing-comparison",
    label: "Model ↔ drawing",
    title: "Analysis Model vs Drawing Comparison",
    h1: "Analysis model vs drawing comparison",
    description:
      "Keep the structural analysis model and the issued drawings in step: compare member sizes, node geometry and joint details, and flag revisions never carried through.",
    answer:
      "Model-to-drawing comparison with Nazara AI checks that the structural analysis model and the issued drawings describe the same structure. Member sizes, node geometry and joint details in the in-place model are compared with what was drawn, and when the model changes late in design it shows which drawings still carry the old member or connection.",
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
    problem: {
      heading: "Why models and drawings drift apart",
      body: [
        "On an offshore jacket or topsides, the analysis model and the drawings are produced by different people on different schedules. A brace upsized after an in-place or fatigue run, or a can thickness changed at a node, has to be picked up on every drawing that shows it.",
        "When it is not, the structure that gets fabricated is not the one that was analysed. These mismatches are usually found late — at checking, at fabrication or by the certifying body — when they cost the most to fix.",
      ],
    },
    checks: {
      heading: "What the comparison covers",
      items: [
        { term: "Member sizes", detail: "Diameter, wall thickness and section for each member, compared between the model and every drawing it appears on." },
        { term: "Node geometry", detail: "Node positions and member connectivity compared with the framing shown on the drawings." },
        { term: "Joint details", detail: "Can and stub thicknesses and joint details compared with what the model assumes." },
        { term: "Revision drift", detail: "Model changes traced to drawings that still show the superseded member or connection." },
      ],
    },
    inputs: ["Structural analysis model output", "Member schedules", "Issued drawing sets (PDF)"],
    output: [
      "A mismatch list such as “Brace B-214: drawing shows Ø610×19, model uses Ø610×22”",
      "The drawing sheet and model member behind every mismatch",
      "Engineer decisions recorded per finding, ready to export",
    ],
    faq: [
      {
        q: "How do you check that drawings match the analysis model?",
        a: "Nazara AI extracts member sizes, node geometry and joint details from both the model output and the drawings, then compares them item by item. Each mismatch is listed with the drawing sheet and model member it came from.",
      },
      {
        q: "Which analysis software does it work with?",
        a: "The early access program focuses on structural analysis output used on offshore projects. Tell us which software and formats your team uses when you apply and we will confirm fit.",
      },
      {
        q: "Can it tell which drawings are out of date after a model change?",
        a: "Yes. When a member or connection changes in the model, it flags the drawings that still show the previous size or detail.",
      },
    ],
  },
  {
    slug: "code-compliance",
    label: "Code & spec compliance",
    title: "Offshore Code & Spec Compliance Review",
    h1: "Code and specification compliance review",
    description:
      "Review offshore structural packages against client specifications, the project design basis and codes such as API RP 2A, ISO 19902 and NORSOK N-004, with a traceable record.",
    answer:
      "Compliance review with Nazara AI turns the client specification, the project design basis and the applicable design codes — such as API RP 2A, ISO 19902, NORSOK N-004, DNV-RP-C203 and AWS D1.1 — into a checklist that review agents work through on every package. Each finding links the requirement, the evidence on the drawing or calculation, and the engineer's decision, giving a traceable QA/QC record for internal review or the certifying body.",
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
    problem: {
      heading: "Why compliance review is hard to do consistently",
      body: [
        "Every offshore project carries its own stack of requirements: the client specification, the project design basis and the codes it calls up. Weld categories, inspection extents, material requirements and documentation rules differ from job to job.",
        "Reviewers keep those requirements in their heads or in spreadsheets, and the evidence that each one was met ends up scattered across mark-ups and emails. That makes reviews hard to repeat and hard to demonstrate to a certifying body.",
      ],
    },
    checks: {
      heading: "What the compliance review covers",
      items: [
        { term: "Client specification", detail: "Project-specific requirements — for example weld and NDT categories and material requirements — checked on every package." },
        { term: "Project design basis", detail: "Agreed design criteria and values checked where drawings and calculations depend on them." },
        { term: "Design codes", detail: "Checks framed around the codes the work is reviewed against, such as API RP 2A, ISO 19902, NORSOK N-004, DNV-RP-C203 and AWS D1.1." },
        { term: "Evidence and decision", detail: "Each requirement linked to the evidence found and the engineer's decision on it." },
      ],
    },
    inputs: ["Client specifications", "Project design basis", "Drawing sets and calculation reports to review"],
    output: [
      "A requirement-by-requirement checklist with evidence for each item",
      "Non-compliances and gaps raised as findings with references",
      "An exportable QA/QC record of every engineer decision",
    ],
    faq: [
      {
        q: "Which offshore structural codes does Nazara AI check against?",
        a: "Checks are framed around the codes the work is reviewed against, such as API RP 2A, ISO 19902, NORSOK N-004, DNV-RP-C203 and AWS D1.1, together with the client specification and project design basis that govern the job.",
      },
      {
        q: "Can the QA/QC record be shared with a certifying body?",
        a: "Each finding links the requirement, the evidence and the engineer's decision, and the record can be exported — for example as a PDF report, CSV register or comment sheet — for internal review or a verification body.",
      },
      {
        q: "Does it work with our own client specification?",
        a: "Yes. Client specifications and project requirements are turned into the checklist the agents work through, so the review follows the requirements of your job rather than a generic list.",
      },
    ],
  },
];

export function getUseCase(slug: string) {
  return USE_CASES.find((u) => u.slug === slug);
}
