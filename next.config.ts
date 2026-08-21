import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photography is served from /public today. Add remote patterns
    // here if the shop's photos ever move to a CDN or a Shopify-style host.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
