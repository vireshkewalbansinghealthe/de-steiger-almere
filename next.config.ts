import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development configuration for Docker
  experimental: {
    // Add any experimental features here
  },
  
  // Image optimization settings
  images: {
    unoptimized: true, // For better compatibility
  },
};

export default nextConfig;
