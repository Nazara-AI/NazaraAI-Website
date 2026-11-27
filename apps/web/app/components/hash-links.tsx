"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Drop "#section" from the address bar, keeping the path and any query string. */
function clearHash() {
  if (window.location.hash) {
    history.replaceState(history.state, "", window.location.pathname + window.location.search);
  }
}

/** Scroll to the section named in the current URL's hash (if it exists), then remove the hash. */
function landOnHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return clearHash();
  const target = document.getElementById(id);
  if (!target) return; // unknown hash: leave the URL alone
  target.scrollIntoView();
  clearHash();
}

/**
 * Keeps "#section" out of the address bar.
 *
 * - Clicking a link to a section on the current page ("#faq" or "/#faq" while on "/") scrolls
 *   there without adding the hash.
 * - Arriving with a hash (a shared link, a typed URL, or a "/#faq" link from another page)
 *   still lands on the section; the hash is then removed.
 */
export function HashLinks() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const id = decodeURIComponent(url.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (id && !target) return;
      e.preventDefault();
      if (target) target.scrollIntoView();
      else window.scrollTo({ top: 0 });
      clearHash();
    }
    // Capture phase: run before Next's <Link>, which would otherwise push "/#id" itself.
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", landOnHash);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", landOnHash);
    };
  }, []);

  // After a page load or client-side navigation, let the page render, then land and tidy the URL.
  useEffect(() => {
    if (!window.location.hash) return;
    const raf = requestAnimationFrame(landOnHash);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
