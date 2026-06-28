import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AdminProviders } from '@/components/AdminProviders';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Food Studio Admin', template: '%s | Admin' },
  robots: 'noindex, nofollow',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
