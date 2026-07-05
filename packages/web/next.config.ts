import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@komunify/shared'],
  reactStrictMode: true,
};

export default nextConfig;
