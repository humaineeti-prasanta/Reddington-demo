import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { rupees } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function ProductCard({ product, wishlisted = false, onWishlistToggle }) {
  const off = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <Card className="group relative overflow-hidden p-0">
      <button
        type="button"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={(e) => {
          e.preventDefault();
          onWishlistToggle?.(product.id, wishlisted);
        }}
        className="absolute right-2 top-2 z-10 rounded-full bg-background/90 p-2 shadow-sm transition hover:bg-background"
      >
        <Heart className={cn('size-4', wishlisted ? 'fill-primary text-primary' : 'text-foreground/70')} />
      </button>

      <Link to={`/products/${product.id}`}>
        <div className="aspect-[3/4] w-full overflow-hidden bg-secondary">
          <img
            src={product.images?.[0]}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="space-y-1 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </span>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Star className="size-3 fill-primary text-primary" />
              {product.rating.toFixed(1)}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-semibold">{rupees(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">{rupees(product.mrp)}</span>
                <span className="text-xs font-semibold text-primary">{off}% off</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
