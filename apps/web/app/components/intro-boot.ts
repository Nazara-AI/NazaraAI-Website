/** Shared by the root layout (server) and SiteLoader (client). */
export const INTRO_SESSION_KEY = "nz-intro-seen";

/** Photo behind the loading screen; requested by the boot script so it isn't discovered late via CSS. */
export const LOADER_IMAGE = "/loader.webp";

/**
 * Runs inline before first paint. Shows the loading screen only on a fresh homepage visit
 * (no hash, not seen this session, motion allowed) by setting html[data-intro="play"],
 * and starts the loader photo downloading at high priority only in that case.
 */
export const INTRO_BOOT_SCRIPT = `try{var d=document.documentElement;if(location.pathname==="/"&&!location.hash&&!sessionStorage.getItem("${INTRO_SESSION_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="play";var l=document.createElement("link");l.rel="preload";l.as="image";l.href="${LOADER_IMAGE}";l.fetchPriority="high";document.head.appendChild(l)}}catch(e){}`;
