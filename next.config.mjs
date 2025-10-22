import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      recharts: path.resolve(process.cwd(), "lib/recharts.tsx")
    };
    return config;
  }
};

export default nextConfig;
