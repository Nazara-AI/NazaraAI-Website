"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow } from "./ui";

type Tab = {
  slug: string;
  label: string;
  pipeline: string[];
  cards: { title: string; body: string }[];
};

/** All panels are server-rendered (inactive ones `hidden`) so every use case is in the HTML. */
export function UseCaseTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].slug);

  return (
    <>
      <div role="tablist" aria-label="Use cases" className="mt-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tabs.map((u) => {
          const on = u.slug === active;
          return (
            <button
              key={u.slug}
              type="button"
              role="tab"
              id={`tab-${u.slug}`}
              aria-selected={on}
              aria-controls={`panel-${u.slug}`}
              onClick={() => setActive(u.slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink-soft hover:border-ink/30 hover:text-ink"
              }`}
            >
              {u.label}
            </button>
          );
        })}
      </div>

      {tabs.map((u) => (
        <div
          key={u.slug}
          role="tabpanel"
          id={`panel-${u.slug}`}
          aria-labelledby={`tab-${u.slug}`}
          hidden={u.slug !== active}
          className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
            {u.pipeline.map((stage, i) => (
              <span key={stage} className="flex items-center gap-2">
                <span className="rounded-md bg-paper px-2.5 py-1 text-ink-soft ring-1 ring-line ring-inset">{stage}</span>
                {i < u.pipeline.length - 1 && <Arrow />}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
            {u.cards.map((c) => (
              <div key={c.title} className="border-l-2 border-brand pl-5">
                <h3 className="text-lg leading-snug font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
              </div>
            ))}
          </div>
          <Link
            href={`/use-cases/${u.slug}`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            More on {u.label.toLowerCase()} <Arrow />
          </Link>
        </div>
      ))}
    </>
  );
}
