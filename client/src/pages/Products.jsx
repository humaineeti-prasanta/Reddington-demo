import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import ProductCard from '@/components/ProductCard';
import { useWishlist, useToggleWishlist } from '@/hooks/commerce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || '';
  const page = Number(params.get('page') || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, search, sort, page }],
    queryFn: async () =>
      (await api.get('/products', { params: { category, search, sort, page, limit: 12 } })).data,
  });

  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();
  const wishlistedIds = useMemo(
    () => new Set((wishlist || []).map((w) => w.productId)),
    [wishlist]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold capitalize">{category || 'All products'}</h1>
          {search && <p className="text-sm text-muted-foreground">Results for “{search}”</p>}
        </div>
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill active={!category} onClick={() => setParam('category', '')}>
          All
        </Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c} active={category === c} onClick={() => setParam('category', c)}>
            {c}
          </Pill>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
          ))}
        </div>
      ) : data?.items?.length ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wishlisted={wishlistedIds.has(p.id)}
                onWishlistToggle={(productId, wishlisted) => toggle.mutate({ productId, wishlisted })}
              />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>
                Previous
              </Button>
              <Badge variant="secondary">
                Page {data.page} of {data.pages}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pages}
                onClick={() => setParam('page', String(page + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No products found. Try a different filter or search.
        </div>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition',
        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
      )}
    >
      {children}
    </button>
  );
}
