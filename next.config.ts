import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // z-commerce serves product media from the client's asset CDN.
    // Tighten this to that host once it's known (e.g. "assets.brand.com").
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
