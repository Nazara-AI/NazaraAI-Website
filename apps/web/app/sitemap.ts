import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";
import { USE_CASES } from "./use-cases/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/use-cases`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    ...USE_CASES.map((u) => ({
      url: `${SITE_URL}/use-cases/${u.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
