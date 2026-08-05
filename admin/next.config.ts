import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.foodstudio.vn' },
    ],
    unoptimized: true,
  },
};

export default config;
