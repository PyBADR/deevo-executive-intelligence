/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow API calls to the intelligence backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // Production optimizations
  poweredByHeader: false,

  // Note: standalone output removed — not needed for Vercel and causes
  // ENOENT with route groups like (dashboard) in Next.js 14
};

module.exports = nextConfig;
