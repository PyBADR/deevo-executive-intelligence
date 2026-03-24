/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export — bypasses the Next.js 14 route-group ENOENT bug on Vercel
  output: "export",

  // Production optimizations
  poweredByHeader: false,

  // Static export requires no image optimization (or use a custom loader)
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
