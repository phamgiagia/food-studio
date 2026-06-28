import Link from 'next/link';
import Image from 'next/image';
import { MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarRating } from '@/components/reviews/StarRating';
import type { SellerProfile } from '@food-studio/types';

type CardSeller = Pick<SellerProfile, 'id' | 'storeName' | 'slug' | 'logoUrl' | 'province' | 'region' | 'rating' | 'reviewCount' | 'verified' | 'description'>;

export function SellerCard({ seller }: { seller: CardSeller }) {
  return (
    <Link href={`/sellers/${seller.slug}`} className="group block bg-white rounded-2xl border border-earth-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-24 bg-gradient-to-br from-brand-100 to-earth-100">
        {seller.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white rounded-full px-2 py-1 text-xs font-semibold text-brand-600 shadow-sm">
            <ShieldCheckIcon className="w-3 h-3" />
            Uy tín
          </div>
        )}
      </div>
      <div className="px-4 pb-4 -mt-8 relative">
        <div className="w-16 h-16 rounded-2xl border-4 border-white bg-earth-100 mb-3 overflow-hidden">
          {seller.logoUrl ? (
            <Image src={seller.logoUrl} alt={seller.storeName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand-500">
              {seller.storeName[0]}
            </div>
          )}
        </div>
        <h3 className="font-bold text-earth-900 group-hover:text-brand-600 transition-colors mb-1">
          {seller.storeName}
        </h3>
        <div className="flex items-center gap-1 text-earth-500 text-xs mb-2">
          <MapPinIcon className="w-3.5 h-3.5" />
          {seller.province}
        </div>
        {seller.rating && (
          <StarRating rating={seller.rating} size="sm" showValue count={seller.reviewCount} />
        )}
        {seller.description && (
          <p className="text-earth-500 text-xs mt-2 line-clamp-2">{seller.description}</p>
        )}
      </div>
    </Link>
  );
}
