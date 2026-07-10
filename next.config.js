/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Bundle size optimization
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "react-icons",
    ],
  },

  // Gzip compression
  compress: true,

  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // PWA: make sure the service worker file itself is always
  // revalidated. Without this, browsers can cache sw.js for hours,
  // which delays customers getting bug fixes / new deploys since the
  // old worker keeps intercepting requests until its cached copy expires.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
