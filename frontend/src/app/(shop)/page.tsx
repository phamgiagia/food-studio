import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCollections } from '@/components/home/FeaturedCollections';
import { RegionalDiscovery } from '@/components/home/RegionalDiscovery';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { SocialProof } from '@/components/home/SocialProof';
import { SellerStories } from '@/components/home/SellerStories';
import { NewsletterCTA } from '@/components/home/NewsletterCTA';

export const metadata: Metadata = {
  title: 'Food Studio | Đặc Sản Vùng Miền Việt Nam',
};

export default async function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedCollections />
      <RegionalDiscovery />
      <TrendingProducts />
      <SocialProof />
      <SellerStories />
      <NewsletterCTA />
    </main>
  );
}
