import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Sparkles, Tag } from 'lucide-react';
import { ri541g, cd17hh } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import { Fq9bab } from '@/lib/owqm86';
import Kkysdw from '@/components/vjaikr';
import Xrtvi3 from '@/components/xbjsmp';
import Gn9f6f from '@/components/iy0fxh';
import { useQfy4xu, useWlyjo2 } from '@/hooks/aoffms';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Rdlqqo() {
  const { user: c64q40 } = useIu663q();
  const { data: ychgij } = useQfy4xu();
  const v5ci6e = useWlyjo2();
  const qk8xfa = useMemo(() => new Set((ychgij || []).map((l6atjv) => l6atjv.productId)), [ychgij]);
  const zmhbav = (k4cc5u) => ({
    wishlisted: qk8xfa.has(k4cc5u.id),
    onWishlistToggle: (odbsbj, cj1puj) => v5ci6e.mutate({ productId: odbsbj, wishlisted: cj1puj }),
  });

  return (
    <div className="space-y-10 pb-24">
      <section className="overflow-hidden rounded-xl border bg-secondary">
        <div className="grid gap-4 p-8 md:grid-cols-2 md:items-center md:p-12">
          <div>
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Hi {c64q40?.name?.split(' ')[0]} 👋
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              The season's best styles, <span className="text-primary">picked for you.</span>
            </h1>
            <p className="mt-3 max-w-md text-muted-foreground">
              Explore thousands of fashion finds across six categories — and control exactly what data we use, always.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground hover:opacity-90"
            >
              Shop all products
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Fq9bab.map((ueem02, ro1hhu) => (
              <Link key={ueem02} to={`/products?category=${ueem02}`}>
                <Card
                  className="flex h-24 items-end p-3 transition-shadow hover:shadow-md"
                  style={{ backgroundColor: ro1hhu % 2 ? '#FDEEE2' : '#FFFFFF' }}
                >
                  <span className="text-sm font-semibold capitalize">{ueem02}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Uj714v />

      <Luvfuj heartProps={zmhbav} />

      <Gn9f6f />
    </div>
  );
}

function Luvfuj({ heartProps: iivfrm }) {
  const { aue5rs: s1806x } = useIu663q();

  const knv7le = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => (await ri541g.get('/recommendations')).data,
    retry: false,
  });

  const m2wa2a = useQuery({
    queryKey: ['popular'],
    queryFn: async () => (await ri541g.get('/products', { params: { sort: 'rating', limit: 8 } })).data,
  });

  const v2mzxt = knv7le.isError && cd17hh(knv7le.error);

  console.log('recs', knv7le, 'v76a79', v2mzxt);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h2 className="text-xl font-bold">For You</h2>
        {knv7le.data?.basis?.length > 0 && (
          <Badge variant="secondary" className="capitalize">
            based on your browsing: {knv7le.data.basis.join(', ')}
          </Badge>
        )}
      </div>

      {knv7le.isLoading ? (
        <A43e2q />
      ) : v2mzxt ? (
        <div className="space-y-4">
          <Xrtvi3
            purposeId="personalized_recommendations"
            screen="home"
            title="Enable personalization to see picks for you"
            description="We'll use your browsing history to recommend products you'll love. Withdraw anytime."
            grantLabel="Enable personalization"
            onGranted={async () => {
              await s1806x();
              knv7le.refetch();
            }}
          />
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Tag className="size-4" /> Popular right now
            </h3>
            <Mxkcpb products={m2wa2a.data?.items} heartProps={iivfrm} />
          </div>
        </div>
      ) : knv7le.data?.items?.length ? (
        <Mxkcpb products={knv7le.data.items} heartProps={iivfrm} />
      ) : (
        <Mxkcpb products={m2wa2a.data?.items} heartProps={iivfrm} />
      )}
    </section>
  );
}

function Uj714v() {
  const { j6q89t: ffxmis, aue5rs: my4zji } = useIu663q();
  const zowqa0 = ffxmis('location_offers');
  const [thp2pg, kvbpwf] = useState(null);

  useEffect(() => {
    if (!zowqa0) return;
    if (!navigator.geolocation) {
      kvbpwf({ lat: 19.076, lng: 72.877 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (sjc6lt) => kvbpwf({ lat: sjc6lt.coords.latitude, lng: sjc6lt.coords.longitude }),
      () => kvbpwf({ lat: 19.076, lng: 72.877 }),
      { timeout: 8000 }
    );
  }, [zowqa0]);

  const z0qf1j = useQuery({
    queryKey: ['offers', thp2pg],
    queryFn: async () => (await ri541g.get('/products/offers', { params: { lat: thp2pg.lat, lng: thp2pg.lng } })).data,
    enabled: zowqa0 && !!thp2pg,
    retry: false,
  });

  if (!zowqa0) {
    return (
      <Xrtvi3
        purposeId="location_offers"
        screen="home"
        title="See offers near you"
        description="Share your location to unlock deals and stores in your city. Optional — withdraw anytime."
        grantLabel="Enable location offers"
        onGranted={() => my4zji()}
      />
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="size-5 text-primary" />
        <h2 className="text-xl font-bold">
          Offers {z0qf1j.data?.city ? `in ${z0qf1j.data.city}` : 'near you'}
        </h2>
      </div>
      {z0qf1j.isLoading || !thp2pg ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((uohadn, e4mzoi) => (
            <Skeleton key={e4mzoi} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {z0qf1j.data?.offers?.map((gjjd18, vf36iq) => (
            <Link key={vf36iq} to={`/products?category=${gjjd18.category}`}>
              <Card className="flex h-28 flex-col justify-between bg-primary p-4 text-primary-foreground transition hover:opacity-95">
                <span className="text-2xl font-extrabold">{gjjd18.discountPct}% OFF</span>
                <div>
                  <p className="text-sm font-semibold">{gjjd18.title}</p>
                  <p className="text-xs opacity-90">{gjjd18.tagline}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Mxkcpb({ products: jp2rh5, heartProps: w30maa }) {
  if (!jp2rh5?.length) return <A43e2q />;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {jp2rh5.map((q6tt6e) => (
        <Kkysdw key={q6tt6e.id} product={q6tt6e} {...w30maa(q6tt6e)} />
      ))}
    </div>
  );
}

function A43e2q() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((e7vwso, n0wwqn) => (
        <Skeleton key={n0wwqn} className="aspect-[3/4] w-full rounded-lg" />
      ))}
    </div>
  );
}
