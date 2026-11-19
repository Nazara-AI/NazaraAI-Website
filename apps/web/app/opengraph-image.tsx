import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "./site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logo.svg"), "utf8");
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;
  const grid = "rgba(34,197,94,0.08)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#07120c",
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", background: "white", borderRadius: 14, padding: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={52} height={52} alt="" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{SITE.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: "#22c55e", textTransform: "uppercase" }}>
            AI for offshore structural design
          </div>
          <div style={{ marginTop: 22, fontSize: 68, fontWeight: 800, lineHeight: 1.08, maxWidth: 980 }}>
            QA/QC that reads the drawings before your checker has to.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 22, color: "rgba(255,255,255,0.65)" }}>
          {["Drawings", "Calculations", "Analysis models", "Engineer-approved findings"].map((t) => (
            <div
              key={t}
              style={{ display: "flex", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "8px 20px" }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
