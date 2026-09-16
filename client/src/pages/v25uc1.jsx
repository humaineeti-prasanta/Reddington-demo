import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Heart, Star, Minus, Plus } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { pak2w5 } from '@/lib/owqm86';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useL9zga7, useQfy4xu, useWlyjo2 } from '@/hooks/aoffms';

export default function Nh0byf() {
  const { id: sba4qd } = useParams();
  const [le53w2, v9m74o] = useState(0);
  const [wznu9n, urx65f] = useState('');
  const [doh3b4, wlokwp] = useState(1);

  const { data: mjto39, isLoading: n6bcr6 } = useQuery({
    queryKey: ['product', sba4qd],
    queryFn: async () => (await ri541g.get(`/products/${sba4qd}`)).data,
  });

  const { add: gito8k } = useL9zga7();
  const { data: zr8rcs } = useQfy4xu();
  const ujgapo = useWlyjo2();
  const on64bv = (zr8rcs || []).some((xmycow) => xmycow.productId === sba4qd);

  useEffect(() => {
    if (!sba4qd) return;
    ri541g.post('/recommendations/view', { productId: sba4qd }).catch(() => {});
  }, [sba4qd]);


  useEffect(() => {
    if (!mjto39) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        items: [{ item_id: mjto39.id, item_name: mjto39.title, item_category: mjto39.category, price: mjto39.price / 100, currency: 'INR' }],
      },
    });
  }, [mjto39]);

  if (n6bcr6) {
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
  if (!mjto39) return <div className="p-12 text-center text-muted-foreground">Product not found.</div>;

  const j9a006 = mjto39.sizes?.length > 0;
  const ib0awk = mjto39.mrp > mjto39.price ? Math.round((1 - mjto39.price / mjto39.mrp) * 100) : 0;

  const brnp1a = () => {
    if (j9a006 && !wznu9n) {
      toast.error('Please select a size.');
      return;
    }
    gito8k.mutate(
      { productId: mjto39.id, qty: doh3b4, size: wznu9n },
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
          <img src={mjto39.images?.[le53w2]} alt={mjto39.title} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 flex gap-2">
          {mjto39.images?.map((oqesiv, y7ik6w) => (
            <button
              key={y7ik6w}
              onClick={() => v9m74o(y7ik6w)}
              className={cn(
                'size-16 overflow-hidden rounded-md border-2',
                le53w2 === y7ik6w ? 'border-primary' : 'border-transparent'
              )}
            >
              <img src={oqesiv} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{mjto39.brand}</p>
        <h1 className="mt-1 text-2xl font-bold">{mjto39.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Star className="size-3 fill-primary text-primary" />
            {mjto39.rating.toFixed(1)}
          </Badge>
          <span className="text-sm capitalize text-muted-foreground">{mjto39.category}</span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold">{pak2w5(mjto39.price)}</span>
          {ib0awk > 0 && (
            <>
              <span className="text-muted-foreground line-through">{pak2w5(mjto39.mrp)}</span>
              <span className="font-semibold text-primary">{ib0awk}% off</span>
            </>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{mjto39.description}</p>

        {j9a006 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Select size</p>
            <div className="flex flex-wrap gap-2">
              {mjto39.sizes.map((lxzyhf) => (
                <button
                  key={lxzyhf}
                  onClick={() => urx65f(lxzyhf)}
                  className={cn(
                    'min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition',
                    wznu9n === lxzyhf ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  )}
                >
                  {lxzyhf}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-md border">
            <button className="p-2" onClick={() => wlokwp((aa3rhy) => Math.max(1, aa3rhy - 1))} aria-label="Decrease">
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">{doh3b4}</span>
            <button className="p-2" onClick={() => wlokwp((pb0scx) => pb0scx + 1)} aria-label="Increase">
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" size="lg" onClick={brnp1a} disabled={gito8k.isPending}>
            Add to cart
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => ujgapo.mutate({ productId: mjto39.id, wishlisted: on64bv })}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('size-5', on64bv && 'fill-primary text-primary')} />
          </Button>
        </div>
      </div>
    </div>
  );
}
