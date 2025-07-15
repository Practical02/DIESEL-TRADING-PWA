import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'export' output since we need API routes for database functionality
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
