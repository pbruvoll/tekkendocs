import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeartButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  size?: number;
};

export const HeartButton = ({
  isFavorite,
  onToggle,
  className,
  size = 20,
}: HeartButtonProps) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'rounded-full p-1 transition-colors hover:bg-background/80',
        className,
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        className={cn(
          'transition-colors cursor-pointer',
          isFavorite
            ? 'fill-primary/90 hover:fill-primary text-primary'
            : 'fill-none text-muted-foreground hover:text-primary',
        )}
      />
    </button>
  );
};
