import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // z-commerce serves product media from the client's asset CDN.
    // Tighten this to that host once it's known (e.g. "assets.brand.com").
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Products have no pages of their own any more; old and indexed product URLs land on the shop
  async redirects() {
    return [{ source: "/shop/:slug", destination: "/shop", permanent: true }];
  },
};

export default nextConfig;
