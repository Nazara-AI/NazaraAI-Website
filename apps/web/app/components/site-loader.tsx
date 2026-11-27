"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { INTRO_SESSION_KEY } from "./intro-boot";

/**
 * "Horizon" loading screen, shown once per session on the homepage.
 *
 * A hairline draws across the centre, opens into a letterbox aperture onto the platform photo
 * and widens to full bleed, then the screen splits along that same horizon to reveal the site. The motion is pure CSS and starts with the first paint (the
 * markup is server-rendered); this component only decides when to split.
 *
 * Whether it shows is decided before first paint by INTRO_BOOT_SCRIPT (root layout), which sets
 * html[data-intro="play"]. Without that attribute CSS keeps the overlay hidden, so no-JS visitors,
 * reduced-motion users and repeat visits go straight to the site.
 */

/** Length of the CSS timeline (aperture reaches full bleed); the split waits for it to finish. */
const TIMELINE_MS = 3050;
/** How much longer to hold for the page's `load` event before splitting anyway. */
const MAX_EXTRA_MS = 800;
const EXIT_MS = 900;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

function Scene({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="hz-scene" aria-hidden={hidden || undefined}>
      <div className="hz-aperture">
        <div className="hz-photo" />
      </div>
      <span className="hz-line" />

      <div className="hz-meta hz-meta-top">
        <span>Nazara AI</span>
        <span>Offshore structural design</span>
      </div>
      <div className="hz-meta hz-meta-bottom">
        <span>Engineer-led QA/QC</span>
        <span className="hz-count" />
      </div>
    </div>
  );
}

export function SiteLoader() {
  const [state, setState] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") return;
    root.style.overflow = "hidden";

    let cancelled = false;
    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    // The CSS timeline began at first paint, which can be well before hydration; ask it how far along it is.
    const anim = document.querySelector(".hz-aperture")?.getAnimations?.()[0];
    const elapsed = typeof anim?.currentTime === "number" ? anim.currentTime : 0;
    const remaining = Math.max(0, TIMELINE_MS - elapsed);

    void Promise.race([Promise.all([pageLoaded, wait(remaining)]), wait(remaining + MAX_EXTRA_MS)]).then(async () => {
      if (cancelled) return;
      // Commit "leaving" before flipping the attribute: in between, neither CSS selector would match,
      // the overlay would drop to display:none and every animation would restart from zero.
      flushSync(() => setState("leaving"));
      root.dataset.intro = "done"; // releases the hero entrance behind the split
      root.style.overflow = "";
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {}
      await wait(EXIT_MS);
      if (!cancelled) setState("gone");
    });

    return () => {
      cancelled = true;
      root.style.overflow = "";
    };
  }, []);

  if (state === "gone") return null;

  // The scene is rendered twice, clipped to its top and bottom halves, so it can split on the horizon.
  return (
    <div className="site-loader" data-state={state} role="status" aria-label="Loading Nazara AI">
      <div className="hz-half hz-top">
        <Scene />
      </div>
      <div className="hz-half hz-bottom" aria-hidden="true">
        <Scene hidden />
      </div>
      <div className="hz-grain" aria-hidden="true" />
    </div>
  );
}
