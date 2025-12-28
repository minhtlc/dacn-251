import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable faster refresh
  reactStrictMode: true,
  // TypeScript optimization - only check on build, not dev
  typescript: {
    // Type checking is done separately, not during compilation in dev mode
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
