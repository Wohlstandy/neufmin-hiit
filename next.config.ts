import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/neufmin-hiit',
  assetPrefix: '/neufmin-hiit/',
  images: { unoptimized: true },
};

export default nextConfig;
