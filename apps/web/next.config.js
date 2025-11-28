/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@signalsync/database', '@signalsync/types', '@signalsync/logger'],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
