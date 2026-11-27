import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Sign up lives on the sign-in page now (its "Create account" side); old links keep working
  async redirects() {
    return [{ source: "/signup", destination: "/login?mode=signup", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Every <Image> encodes at 90 instead of Next's default 75, which left photos soft. Images without a
    // `quality` prop take the closest value listed here, so this one setting covers the whole site.
    qualities: [90],
    // z-commerce serves product media from the client's asset CDN.
    // Tighten this to that host once it's known (e.g. "assets.brand.com").
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
