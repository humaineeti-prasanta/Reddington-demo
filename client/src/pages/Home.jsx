import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Sparkles, Tag } from 'lucide-react';
import { api, isConsentError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/lib/constants';
import ProductCard from '@/components/ProductCard';
import ConsentPrompt from '@/components/ConsentPrompt';
import AnalyticsBanner from '@/components/AnalyticsBanner';
import { useWishlist, useToggleWishlist } from '@/hooks/commerce';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user } = useAuth();
  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();
  const wishlistedIds = useMemo(() => new Set((wishlist || []).map((w) => w.productId)), [wishlist]);
  const heartProps = (p) => ({
    wishlisted: wishlistedIds.has(p.id),
    onWishlistToggle: (productId, wishlisted) => toggle.mutate({ productId, wishlisted }),
  });

  return (
    <div className="space-y-10 pb-24">
      {/* Hero */}
      <section className="overflow-hidden rounded-xl border bg-secondary">
        <div className="grid gap-4 p-8 md:grid-cols-2 md:items-center md:p-12">
          <div>
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Hi {user?.name?.split(' ')[0]} 👋
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
            {CATEGORIES.map((c, i) => (
              <Link key={c} to={`/products?category=${c}`}>
                <Card
                  className="flex h-24 items-end p-3 transition-shadow hover:shadow-md"
                  style={{ backgroundColor: i % 2 ? '#FDEEE2' : '#FFFFFF' }}
                >
                  <span className="text-sm font-semibold capitalize">{c}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Location offers strip */}
      <OffersStrip />

      {/* For You */}
      <ForYou heartProps={heartProps} />

      <AnalyticsBanner />
    </div>
  );
}

function ForYou({ heartProps }) {
  const { refreshConsents } = useAuth();

  const recs = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => (await api.get('/recommendations')).data,
    retry: false,
  });

  const popular = useQuery({
    queryKey: ['popular'],
    queryFn: async () => (await api.get('/products', { params: { sort: 'rating', limit: 8 } })).data,
  });

  const consentBlocked = recs.isError && isConsentError(recs.error);

  console.log('recs', recs, 'consentBlocked', consentBlocked);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h2 className="text-xl font-bold">For You</h2>
        {recs.data?.basis?.length > 0 && (
          <Badge variant="secondary" className="capitalize">
            based on your browsing: {recs.data.basis.join(', ')}
          </Badge>
        )}
      </div>

      {recs.isLoading ? (
        <ProductGridSkeleton />
      ) : consentBlocked ? (
        <div className="space-y-4">
          <ConsentPrompt
            purposeId="personalized_recommendations"
            screen="home"
            title="Enable personalization to see picks for you"
            description="We'll use your browsing history to recommend products you'll love. Withdraw anytime."
            grantLabel="Enable personalization"
            onGranted={async () => {
              await refreshConsents();
              recs.refetch();
            }}
          />
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Tag className="size-4" /> Popular right now
            </h3>
            <ProductGrid products={popular.data?.items} heartProps={heartProps} />
          </div>
        </div>
      ) : recs.data?.items?.length ? (
        <ProductGrid products={recs.data.items} heartProps={heartProps} />
      ) : (
        <ProductGrid products={popular.data?.items} heartProps={heartProps} />
      )}
    </section>
  );
}

function OffersStrip() {
  const { hasConsent, refreshConsents } = useAuth();
  const granted = hasConsent('location_offers');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!granted) return;
    if (!navigator.geolocation) {
      setCoords({ lat: 19.076, lng: 72.877 }); // fallback so the strip still works
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 19.076, lng: 72.877 }),
      { timeout: 8000 }
    );
  }, [granted]);

  const offers = useQuery({
    queryKey: ['offers', coords],
    queryFn: async () => (await api.get('/products/offers', { params: { lat: coords.lat, lng: coords.lng } })).data,
    enabled: granted && !!coords,
    retry: false,
  });

  if (!granted) {
    return (
      <ConsentPrompt
        purposeId="location_offers"
        screen="home"
        title="See offers near you"
        description="Share your location to unlock deals and stores in your city. Optional — withdraw anytime."
        grantLabel="Enable location offers"
        onGranted={() => refreshConsents()}
      />
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="size-5 text-primary" />
        <h2 className="text-xl font-bold">
          Offers {offers.data?.city ? `in ${offers.data.city}` : 'near you'}
        </h2>
      </div>
      {offers.isLoading || !coords ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {offers.data?.offers?.map((o, i) => (
            <Link key={i} to={`/products?category=${o.category}`}>
              <Card className="flex h-28 flex-col justify-between bg-primary p-4 text-primary-foreground transition hover:opacity-95">
                <span className="text-2xl font-extrabold">{o.discountPct}% OFF</span>
                <div>
                  <p className="text-sm font-semibold">{o.title}</p>
                  <p className="text-xs opacity-90">{o.tagline}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductGrid({ products, heartProps }) {
  if (!products?.length) return <ProductGridSkeleton />;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} {...heartProps(p)} />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
      ))}
    </div>
  );
}
