"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

/** Cal.com booking path, e.g. "nazara/demo". Inlined at build time. */
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK?.replace(/^https?:\/\/(app\.)?cal\.com\//, "").replace(/\/+$/, "");
const NAMESPACE = "demo";

/** Opens the Cal.com booking calendar in a popup. Renders nothing until NEXT_PUBLIC_CAL_LINK is set. */
export function BookDemoButton({ className }: { className?: string }) {
  useEffect(() => {
    if (!CAL_LINK) return;
    (async () => {
      const cal = await getCalApi({ namespace: NAMESPACE });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  if (!CAL_LINK) return null;

  return (
    <button
      type="button"
      data-cal-namespace={NAMESPACE}
      data-cal-link={CAL_LINK}
      data-cal-config='{"layout":"month_view"}'
      className={className}
    >
      Book a demo
    </button>
  );
}
