import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import Kkysdw from '@/components/vjaikr';
import { useQfy4xu, useWlyjo2, useL9zga7 } from '@/hooks/aoffms';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function C3s5q0() {
  const { data: k6rgss, isLoading: z4m38y } = useQfy4xu();
  const r07i6u = useWlyjo2();
  const { add: km6sod } = useL9zga7();

  if (z4m38y) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((ihbpjp, e740mx) => (
          <Skeleton key={e740mx} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {k6rgss?.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {k6rgss.map((kzsv0d) => (
            <div key={kzsv0d.id} className="space-y-2">
              <Kkysdw
                product={kzsv0d.product}
                wishlisted
                onWishlistToggle={(t72cpp) => r07i6u.mutate({ productId: t72cpp, wishlisted: true })}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  km6sod.mutate(
                    { productId: kzsv0d.productId, qty: 1, size: kzsv0d.product.sizes?.[0] || '' },
                    { onSuccess: () => toast.success('Added to cart.') }
                  )
                }
              >
                Move to cart
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <Heart className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Button asChild>
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
