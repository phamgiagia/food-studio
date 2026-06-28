import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.foodstudio.vn' },
    ],
  },
};

export default config;
