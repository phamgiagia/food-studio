import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: {
    default: 'Food Studio | Đặc Sản Vùng Miền',
    template: '%s | Food Studio',
  },
  description: 'Khám phá và mua sắm đặc sản vùng miền Việt Nam. Hương vị quê hương, giao tận tay.',
  keywords: ['đặc sản', 'vùng miền', 'food', 'marketplace', 'Việt Nam'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://foodstudio.vn',
    siteName: 'Food Studio',
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
