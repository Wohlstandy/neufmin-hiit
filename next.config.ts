import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/septmin-hiit',
  assetPrefix: '/septmin-hiit/',
  images: { unoptimized: true },
};

export default nextConfig;
