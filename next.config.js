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
};

module.exports = nextConfig;
