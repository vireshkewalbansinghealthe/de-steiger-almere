/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration for Docker
  experimental: {
    // Add any experimental features here
  },
  
  // Image optimization settings
  images: {
    unoptimized: true, // For better compatibility
  },
};

module.exports = nextConfig;
