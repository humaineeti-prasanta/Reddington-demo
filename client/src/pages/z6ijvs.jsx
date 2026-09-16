import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ri541g } from '@/lib/vnw5tu';
import { Fq9bab } from '@/lib/owqm86';
import Kkysdw from '@/components/vjaikr';
import { useQfy4xu, useWlyjo2 } from '@/hooks/aoffms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Blqtzk = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function J3z50w() {
  const [xvee83, n42ub8] = useSearchParams();
  const furg9g = xvee83.get('category') || '';
  const nh7miw = xvee83.get('search') || '';
  const fhyipj = xvee83.get('sort') || '';
  const jzcakz = Number(xvee83.get('page') || 1);

  const j1nxkk = (ib0ti5, khp27n) => {
    const n2uazr = new URLSearchParams(xvee83);
    if (khp27n) n2uazr.set(ib0ti5, khp27n);
    else n2uazr.delete(ib0ti5);
    if (ib0ti5 !== 'page') n2uazr.delete('page');
    n42ub8(n2uazr);
  };

  const { data: xmd2ve, isLoading: tvlhip } = useQuery({
    queryKey: ['products', { category: furg9g, search: nh7miw, sort: fhyipj, page: jzcakz }],
    queryFn: async () =>
      (await ri541g.get('/products', { params: { category: furg9g, search: nh7miw, sort: fhyipj, page: jzcakz, limit: 12 } })).data,
  });

  const { data: fh4kcq } = useQfy4xu();
  const jhf4cu = useWlyjo2();
  const r4imqr = useMemo(
    () => new Set((fh4kcq || []).map((adv61t) => adv61t.productId)),
    [fh4kcq]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold capitalize">{furg9g || 'All products'}</h1>
          {nh7miw && <p className="text-sm text-muted-foreground">Results for “{nh7miw}”</p>}
        </div>
        <select
          value={fhyipj}
          onChange={(z7ac6n) => j1nxkk('sort', z7ac6n.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          {Blqtzk.map((buedud) => (
            <option key={buedud.value} value={buedud.value}>
              {buedud.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Ij0m2x active={!furg9g} onClick={() => j1nxkk('category', '')}>
          All
        </Ij0m2x>
        {Fq9bab.map((xwkx8d) => (
          <Ij0m2x key={xwkx8d} active={furg9g === xwkx8d} onClick={() => j1nxkk('category', xwkx8d)}>
            {xwkx8d}
          </Ij0m2x>
        ))}
      </div>

      {tvlhip ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((c7n748, uq27kg) => (
            <Skeleton key={uq27kg} className="aspect-[3/4] w-full rounded-lg" />
          ))}
        </div>
      ) : xmd2ve?.items?.length ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {xmd2ve.items.map((uacds1) => (
              <Kkysdw
                key={uacds1.id}
                product={uacds1}
                wishlisted={r4imqr.has(uacds1.id)}
                onWishlistToggle={(wrsn7s, ug5gje) => jhf4cu.mutate({ productId: wrsn7s, wishlisted: ug5gje })}
              />
            ))}
          </div>

          {xmd2ve.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={jzcakz <= 1} onClick={() => j1nxkk('page', String(jzcakz - 1))}>
                Previous
              </Button>
              <Badge variant="secondary">
                Page {xmd2ve.page} of {xmd2ve.pages}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled={jzcakz >= xmd2ve.pages}
                onClick={() => j1nxkk('page', String(jzcakz + 1))}
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

function Ij0m2x({ active: uardvg, onClick: mdj4t7, children: giiw69 }) {
  return (
    <button
      type="button"
      onClick={mdj4t7}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition',
        uardvg ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
      )}
    >
      {giiw69}
    </button>
  );
}
