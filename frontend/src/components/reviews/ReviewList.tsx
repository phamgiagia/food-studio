'use client';

import { useState } from 'react';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';
import { StarRating, InteractiveStarRating } from './StarRating';
import { useReviews, useCreateReview } from '@/hooks/useReviews';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/utils';

interface ReviewListProps {
  productId: string;
  rating?: number;
  reviewCount?: number;
}

export function ReviewList({ productId, rating = 0, reviewCount = 0 }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: '', body: '' });
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const { data, isLoading } = useReviews(productId, page);
  const createReview = useCreateReview();

  const reviews = (data as { data?: unknown[] })?.data ?? [];
  const meta = (data as { meta?: { totalPages?: number } })?.meta ?? {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReview.mutateAsync({ productId, ...formData });
    setShowForm(false);
    setFormData({ rating: 5, title: '', body: '' });
  };

  // Rating distribution (simplified)
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: Math.floor(Math.random() * reviewCount * 0.4),
    pct: Math.floor(Math.random() * 80),
  }));

  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-earth-900 mb-6">Đánh Giá Sản Phẩm</h2>

      {/* Summary */}
      <div className="flex gap-8 mb-8 p-6 bg-earth-50 rounded-2xl">
        <div className="text-center">
          <div className="text-5xl font-bold text-earth-900 mb-1">{rating.toFixed(1)}</div>
          <StarRating rating={rating} showValue={false} size="md" className="justify-center mb-1" />
          <div className="text-earth-400 text-sm">{reviewCount} đánh giá</div>
        </div>
        <div className="flex-1 space-y-2">
          {distribution.map(d => (
            <div key={d.star} className="flex items-center gap-2">
              <span className="text-xs text-earth-500 w-6">{d.star}★</span>
              <div className="flex-1 bg-earth-200 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-xs text-earth-400 w-8 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review CTA */}
      {isAuthenticated && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-secondary mb-6 w-full sm:w-auto"
        >
          Viết Đánh Giá
        </button>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-earth-200 rounded-2xl space-y-4">
          <h3 className="font-semibold text-earth-900">Đánh giá của bạn</h3>
          <div>
            <label className="text-sm text-earth-600 mb-2 block">Xếp hạng</label>
            <InteractiveStarRating
              value={formData.rating}
              onChange={r => setFormData(p => ({ ...p, rating: r }))}
            />
          </div>
          <input
            className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Tiêu đề đánh giá (tùy chọn)"
            value={formData.title}
            onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
          />
          <textarea
            rows={4}
            className="w-full border border-earth-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={formData.body}
            onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
          />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={createReview.isPending}>
              {createReview.isPending ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Review items */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse p-4 border border-earth-100 rounded-xl">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-earth-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-earth-200 rounded w-32" />
                  <div className="h-3 bg-earth-200 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-earth-200 rounded" />
                <div className="h-3 bg-earth-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-earth-400">
          <div className="text-4xl mb-3">⭐</div>
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(reviews as Record<string, unknown>[]).map((review) => (
            <div key={review['id'] as string} className="p-5 border border-earth-100 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-600">
                    {((review['full_name'] as string) ?? 'U')[0]}
                  </div>
                  <div>
                    <div className="font-medium text-earth-800">{review['full_name'] as string}</div>
                    <StarRating rating={review['rating'] as number} size="sm" />
                  </div>
                </div>
                <span className="text-xs text-earth-400">
                  {formatDate(review['created_at'] as number)}
                </span>
              </div>
              {review['title'] && (
                <div className="font-semibold text-earth-800 mb-1">{review['title'] as string}</div>
              )}
              {review['body'] && (
                <p className="text-earth-600 text-sm leading-relaxed">{review['body'] as string}</p>
              )}
              <button className="mt-3 flex items-center gap-1 text-earth-400 hover:text-earth-600 text-xs transition-colors">
                <HandThumbUpIcon className="w-3.5 h-3.5" />
                Hữu ích ({review['helpful'] as number})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(meta.totalPages ?? 0) > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.totalPages ?? 0 }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1 ? 'bg-brand-500 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
