import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Default 1200×630 social card (siteConfig.ogImage). Replace with a designed image when the brand has one.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#111111",
        color: "#ffffff",
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", opacity: 0.7 }}>
        {siteConfig.url.replace(/^https?:\/\//, "")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 112, lineHeight: 1 }}>{siteConfig.name}</div>
        <div style={{ fontSize: 40, opacity: 0.8 }}>{siteConfig.tagline}</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
