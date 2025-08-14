import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  
  // Image optimization settings
  images: {
    unoptimized: true, // For static export compatibility
  },
};

export default nextConfig;
