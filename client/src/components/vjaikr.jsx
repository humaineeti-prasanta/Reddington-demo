import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pak2w5 } from '@/lib/owqm86';
import { cn } from '@/lib/utils';

export default function Kkysdw({ product: g99bwj, wishlisted: eikd3c = false, onWishlistToggle: no0p3s }) {
  const nyxl05 = g99bwj.mrp > g99bwj.price ? Math.round((1 - g99bwj.price / g99bwj.mrp) * 100) : 0;

  return (
    <Card className="group relative overflow-hidden p-0">
      <button
        type="button"
        aria-label={eikd3c ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={(mz0rn9) => {
          mz0rn9.preventDefault();
          no0p3s?.(g99bwj.id, eikd3c);
        }}
        className="absolute right-2 top-2 z-10 rounded-full bg-background/90 p-2 shadow-sm transition hover:bg-background"
      >
        <Heart className={cn('size-4', eikd3c ? 'fill-primary text-primary' : 'text-foreground/70')} />
      </button>

      <Link to={`/products/${g99bwj.id}`}>
        <div className="aspect-[3/4] w-full overflow-hidden bg-secondary">
          <img
            src={g99bwj.images?.[0]}
            alt={g99bwj.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="space-y-1 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {g99bwj.brand}
            </span>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Star className="size-3 fill-primary text-primary" />
              {g99bwj.rating.toFixed(1)}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm font-medium">{g99bwj.title}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-semibold">{pak2w5(g99bwj.price)}</span>
            {nyxl05 > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">{pak2w5(g99bwj.mrp)}</span>
                <span className="text-xs font-semibold text-primary">{nyxl05}% off</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
