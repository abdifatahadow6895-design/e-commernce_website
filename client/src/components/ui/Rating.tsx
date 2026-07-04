import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
}

export default function Rating({ rating, count, size = 'sm' }: RatingProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>
      )}
    </div>
  );
}
