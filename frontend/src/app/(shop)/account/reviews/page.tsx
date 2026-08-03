'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

type Review = {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  base_price: number;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  helpful: number;
  created_at: number;
};

type PendingReview = {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  base_price: number;
  order_id: string;
  triggered_at: number;
};

export default function AccountReviewsPage() {
  const [tab, setTab] = useState<'my' | 'pending'>('pending');

  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => api.get<{ data: Review[] }>('/v1/reviews/my'),
    enabled: tab === 'my',
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: () => api.get<{ data: PendingReview[] }>('/v1/reviews/pending'),
    enabled: tab === 'pending',
  });

  const myReviews = Array.isArray(myData) ? (myData as unknown as Review[]) : ((myData as { data: Review[] } | undefined)?.data ?? []);
  const pendingReviews = Array.isArray(pendingData) ? (pendingData as unknown as PendingReview[]) : ((pendingData as { data: PendingReview[] } | undefined)?.data ?? []);

  const StarRow = ({ rating }: { rating: number }) => (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => s <= rating
        ? <StarSolid key={s} className="w-4 h-4 text-yellow-400" />
        : <StarOutline key={s} className="w-4 h-4 text-gray-300" />
      )}
    </span>
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-earth-900 mb-6">Đánh Giá</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'pending' ? 'bg-brand-500 text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
          }`}
        >
          Chờ đánh giá {pendingReviews.length > 0 && `(${pendingReviews.length})`}
        </button>
        <button
          onClick={() => setTab('my')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'my' ? 'bg-brand-500 text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
          }`}
        >
          Đã đánh giá
        </button>
      </div>

      {/* Pending reviews */}
      {tab === 'pending' && (
        <>
          {pendingLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-24 bg-earth-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : pendingReviews.length === 0 ? (
            <div className="bg-white border border-earth-100 rounded-2xl p-10 text-center">
              <StarOutline className="w-12 h-12 text-earth-300 mx-auto mb-3" />
              <p className="text-earth-500">Bạn đã đánh giá hết sản phẩm rồi! Cảm ơn bạn 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map(item => (
                <div key={item.id} className="bg-white border border-earth-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-earth-100 flex items-center justify-center text-earth-400 text-2xl shrink-0">
                    🎁
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-earth-900 truncate">{item.product_name}</h3>
                    <p className="text-sm text-earth-500 mt-0.5">{formatPrice(item.base_price)}</p>
                    <p className="text-xs text-earth-400 mt-1">
                      Mua ngày {formatDate(item.triggered_at)}
                    </p>
                  </div>
                  <a
                    href={`/products/${item.product_slug}`}
                    className="shrink-0 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors"
                  >
                    Đánh giá
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My reviews */}
      {tab === 'my' && (
        <>
          {myLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-earth-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : myReviews.length === 0 ? (
            <div className="bg-white border border-earth-100 rounded-2xl p-10 text-center">
              <StarOutline className="w-12 h-12 text-earth-300 mx-auto mb-3" />
              <p className="text-earth-500">Bạn chưa có đánh giá nào</p>
              <a href="/products" className="text-brand-500 text-sm font-medium mt-2 inline-block hover:underline">
                Khám phá sản phẩm →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {myReviews.map(review => (
                <div key={review.id} className="bg-white border border-earth-100 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-earth-900">{review.product_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRow rating={review.rating} />
                        <span className="text-xs text-earth-400">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-earth-400 px-2 py-1 rounded-lg bg-earth-50">{review.status}</span>
                  </div>
                  {review.title && (
                    <p className="font-medium text-earth-800 text-sm mt-2">{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-earth-600 text-sm mt-1 line-clamp-3">{review.body}</p>
                  )}
                  {review.helpful > 0 && (
                    <p className="text-xs text-green-600 mt-2">👍 {review.helpful} người thấy hữu ích</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}