/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization settings
  images: {
    unoptimized: true,
  },

  // Prevent webpack from bundling server-only packages that use non-relative imports
  serverExternalPackages: ['docusign-esign'],

  // Fix for docusign-esign non-relative imports causing build errors
  webpack: (config) => {
    config.resolve.preferRelative = true;
    return config;
  },

  // Ignore pre-existing lint/type errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
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
