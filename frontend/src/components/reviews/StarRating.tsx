import { StarIcon } from '@heroicons/react/20/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({ rating, max = 5, size = 'md', showValue, count, className }: StarRatingProps) {
  const sizeClass = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span key={i} className="relative">
              <StarOutline className={cn(sizeClass, 'text-earth-200')} />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : '100%' }}
                >
                  <StarIcon className={cn(sizeClass, 'text-amber-400')} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-earth-700">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-sm text-earth-400">({count.toLocaleString()})</span>
      )}
    </div>
  );
}

interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function InteractiveStarRating({ value, onChange, size = 'lg' }: InteractiveStarRatingProps) {
  const sizeClass = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="focus:outline-none"
          aria-label={`${i + 1} sao`}
        >
          <StarIcon className={cn(sizeClass, i < value ? 'text-amber-400' : 'text-earth-200', 'hover:text-amber-300 transition-colors')} />
        </button>
      ))}
    </div>
  );
}
