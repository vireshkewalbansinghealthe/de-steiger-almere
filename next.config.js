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
  
  // Enable standalone output for production builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Allow cross-origin requests for development (Docker/Coolify)
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow all origins in development
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Configure allowed development origins for cross-origin requests
  allowedDevOrigins: [
    '192.168.2.83:3000',
    '192.168.2.83',
    'localhost:3000',
    '127.0.0.1:3000',
    '0.0.0.0:3000',
  ],
};

module.exports = nextConfig;
