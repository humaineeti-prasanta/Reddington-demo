import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useWishlist, useToggleWishlist, useCartMutations } from '@/hooks/commerce';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function Wishlist() {
  const { data: wishlist, isLoading } = useWishlist();
  const toggle = useToggleWishlist();
  const { add } = useCartMutations();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {wishlist?.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((w) => (
            <div key={w.id} className="space-y-2">
              <ProductCard
                product={w.product}
                wishlisted
                onWishlistToggle={(productId) => toggle.mutate({ productId, wishlisted: true })}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  add.mutate(
                    { productId: w.productId, qty: 1, size: w.product.sizes?.[0] || '' },
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
