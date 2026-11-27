/**
 * Companies shown in the scrolling "Supported by" strip under the homepage hero.
 *
 * To add one: put its logo in public/partners/ (SVG or a transparent PNG/WebP works best),
 * then add an entry here. `href` is optional; when set, the logo links to that site.
 *
 *   { name: "Example Co", logo: "/partners/example-co.svg", href: "https://example.com" },
 *
 * While this list is empty the strip is hidden on the live site; in `npm run dev` it shows
 * placeholders so you can see the layout.
 */
export type Supporter = {
  name: string;
  logo: string;
  href?: string;
};

export const SUPPORTERS: Supporter[] = [
  { name: "Ocean Startup Project", logo: "/partners/ocean-startup-project.png" },
  { name: "Genesis", logo: "/partners/genesis.png" },
];
