import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Heart, Star, Minus, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { rupees } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCartMutations, useWishlist, useToggleWishlist } from '@/hooks/commerce';

export default function ProductDetail() {
  const { id } = useParams();
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data,
  });

  const { add } = useCartMutations();
  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();
  const wishlisted = (wishlist || []).some((w) => w.productId === id);

  // Record a product view for recommendations. Silently ignore 403 (gated; ships in Phase 3).
  useEffect(() => {
    if (!id) return;
    api.post('/recommendations/view', { productId: id }).catch(() => {});
  }, [id]);

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  if (!product) return <div className="p-12 text-center text-muted-foreground">Product not found.</div>;

  const needsSize = product.sizes?.length > 0;
  const off = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  const onAdd = () => {
    if (needsSize && !size) {
      toast.error('Please select a size.');
      return;
    }
    add.mutate(
      { productId: product.id, qty, size },
      {
        onSuccess: () => toast.success('Added to cart.'),
        onError: () => toast.error('Could not add to cart.'),
      }
    );
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border bg-secondary">
          <img src={product.images?.[activeImg]} alt={product.title} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 flex gap-2">
          {product.images?.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={cn(
                'size-16 overflow-hidden rounded-md border-2',
                activeImg === i ? 'border-primary' : 'border-transparent'
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <h1 className="mt-1 text-2xl font-bold">{product.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Star className="size-3 fill-primary text-primary" />
            {product.rating.toFixed(1)}
          </Badge>
          <span className="text-sm capitalize text-muted-foreground">{product.category}</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold">{rupees(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-muted-foreground line-through">{rupees(product.mrp)}</span>
              <span className="font-semibold text-primary">{off}% off</span>
            </>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>

        {needsSize && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Select size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    'min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition',
                    size === s ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-md border">
            <button className="p-2" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">{qty}</span>
            <button className="p-2" onClick={() => setQty((q) => q + 1)} aria-label="Increase">
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" size="lg" onClick={onAdd} disabled={add.isPending}>
            Add to cart
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => toggle.mutate({ productId: product.id, wishlisted })}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('size-5', wishlisted && 'fill-primary text-primary')} />
          </Button>
        </div>
      </div>
    </div>
  );
}
