import type { NextConfig } from "next";

// P-DEBUG-LOGIN-AGGRESSIVE Layer 1:
// Force www canonicalization at the Next.js config level (belt-and-suspenders).
// Middleware already does host-level redirect, but this catches any edge cases
// where Next.js handles the request before middleware runs.
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'mitaplus.com' }],
        destination: 'https://www.mitaplus.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
