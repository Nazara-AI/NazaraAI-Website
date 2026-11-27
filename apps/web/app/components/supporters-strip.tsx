/* eslint-disable @next/next/no-img-element -- partner logos are small static files of varying aspect ratios */

import { SUPPORTERS, type Supporter } from "../supporters";

/** Placeholder tiles, shown only in development while SUPPORTERS is empty. */
const PLACEHOLDERS = Array.from({ length: 3 }, (_, i) => ({ name: `Partner logo ${i + 1}`, logo: "" }));

function Logo({ item, linked = true }: { item: Supporter; linked?: boolean }) {
  const content = item.logo ? (
    <img
      src={item.logo}
      alt={item.name}
      className="h-9 w-auto max-w-[13rem] object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:h-11"
      loading="lazy"
      decoding="async"
    />
  ) : (
    <span className="flex h-9 items-center rounded-md border border-dashed border-line px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
      {item.name}
    </span>
  );

  return (
    <li className="group flex shrink-0 items-center">
      {linked && item.href ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.name}>
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}

export function SupportersStrip() {
  const showPlaceholders = SUPPORTERS.length === 0 && process.env.NODE_ENV === "development";
  const items: Supporter[] = SUPPORTERS.length ? SUPPORTERS : showPlaceholders ? PLACEHOLDERS : [];
  if (!items.length) return null;

  return (
    <section aria-labelledby="supporters-heading" className="border-b border-line bg-white px-4 py-10 sm:px-6 sm:py-12">
      <p
        id="supporters-heading"
        className="mb-7 text-center font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted"
      >
        Supported by
      </p>

      <div className="marquee mx-auto max-w-5xl">
        {/* Each company appears once per half. Every half is wider than the strip (see .marquee-group),
            so a company's next appearance is still off-screen when it comes round again. */}
        <div className="marquee-track">
          <ul className="marquee-group">
            {items.map((item) => (
              <Logo key={item.name} item={item} />
            ))}
          </ul>
          <ul className="marquee-group" aria-hidden="true">
            {items.map((item) => (
              <Logo key={item.name} item={item} linked={false} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
