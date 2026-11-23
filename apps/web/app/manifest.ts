import type { MetadataRoute } from "next";
import { SITE } from "./site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "browser",
    background_color: "#f7f8f5",
    theme_color: "#166533",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
