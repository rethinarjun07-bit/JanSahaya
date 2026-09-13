/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    async rewrites() {
      const fastApiUrl = process.env.FASTAPI_BACKEND_URL;
      if (!fastApiUrl) return [];
      return [
        {
          source: '/api/py/:path*',
          destination: `${fastApiUrl}/api/:path*`,
        },
      ];
    },
  };

export default nextConfig;
