import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 requires an explicit allow-list for image optimization quality;
    // without it, next/image requests outside the (now stricter) default get a 400.
    qualities: [75, 100],
  },
};

export default nextConfig;
