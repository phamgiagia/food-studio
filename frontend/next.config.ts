import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.foodstudio.vn' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    ppr: true,
    reactCompiler: true,
  },
};

export default withNextIntl(config);
