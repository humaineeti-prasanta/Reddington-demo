import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, Check, CreditCard, Loader2 } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import { useIowujd } from '@/hooks/aoffms';
import { pak2w5 } from '@/lib/owqm86';
import Xrtvi3 from '@/components/xbjsmp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const F91zpn = ['Address', 'Location', 'Payment'];

export default function Imo1ye() {
  const mcdd3r = useNavigate();
  const gd8cad = useQueryClient();
  const { j6q89t: uamjtr } = useIu663q();
  const { data: ywsfq6 } = useIowujd();

  const [w0qsjy, bysjtb] = useState(0);
  const [fwzkjm, sf3mie] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [df88as, hxp9qj] = useState(false);
  const [shwclo, gy4jbl] = useState(null);
  const [j4x4s7, c41dfm] = useState(false);
  const [nfauz4, adkqw6] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [y50olk, sp37h5] = useState(false);

  const { data: cnspj1 } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await ri541g.get('/users/profile')).data,
  });

  useEffect(() => {
    if (!cnspj1) return;
    const rj3l6v = cnspj1.addresses?.[0];
    sf3mie((gi1k7i) => ({
      ...gi1k7i,
      name: gi1k7i.name || cnspj1.name || '',
      phone: gi1k7i.phone || cnspj1.phone || '',
      line1: gi1k7i.line1 || rj3l6v?.line1 || '',
      line2: gi1k7i.line2 || rj3l6v?.line2 || '',
      city: gi1k7i.city || rj3l6v?.city || '',
      state: gi1k7i.state || rj3l6v?.state || '',
      pincode: gi1k7i.pincode || rj3l6v?.pincode || '',
    }));
  }, [cnspj1]);

  const ft69ee = (gn3arh) => (bf55jn) => sf3mie((q2pm6v) => ({ ...q2pm6v, [gn3arh]: bf55jn.target.value }));
  const yvl4qq = (g873mg) => (jr6sii) => adkqw6((emvt3b) => ({ ...emvt3b, [g873mg]: jr6sii.target.value }));

  const ijyl0u = () => {
    c41dfm(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available in this browser.');
      c41dfm(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (wyalxs) => {
        gy4jbl({ lat: wyalxs.coords.latitude, lng: wyalxs.coords.longitude });
        toast.success('Location captured.');
        c41dfm(false);
      },
      () => {
        toast.error('Could not read your location. You can continue without it.');
        c41dfm(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const lsx2dx = fwzkjm.name && fwzkjm.phone && fwzkjm.line1 && fwzkjm.city && fwzkjm.state && fwzkjm.pincode;

  const nxa5f9 = async () => {
    sp37h5(true);
    try {
      if (df88as) {
        await ri541g.put('/users/profile', {
          name: fwzkjm.name,
          phone: fwzkjm.phone,
          addresses: [{ label: 'Home', line1: fwzkjm.line1, line2: fwzkjm.line2, city: fwzkjm.city, state: fwzkjm.state, pincode: fwzkjm.pincode }],
        });
      }
      const { data: zaof6e } = await ri541g.post('/orders', {
        shipping: fwzkjm,
        includeLocation: !!shwclo,
        locationLat: shwclo?.lat,
        locationLng: shwclo?.lng,
      });
      gd8cad.invalidateQueries({ queryKey: ['cart'] });
      mcdd3r(`/order-success/${zaof6e.id}`);
      window.fbq?.('track', 'Purchase', {
        value: (ywsfq6.subtotal ?? 0) / 100,
        currency: 'INR',
        content_ids: ywsfq6.items.map((rxy6o7) => rxy6o7.productId),
        content_type: 'product',
      });
      window.gtag?.('event', 'purchase', {
        transaction_id: zaof6e.id,
        value: (ywsfq6.subtotal ?? 0) / 100,
        currency: 'INR',
        items: ywsfq6.items.map((i174br) => ({ item_id: i174br.productId, item_name: i174br.product?.title, price: (i174br.product?.price ?? 0) / 100 })),
      });
    } catch (mn1bil) {
      toast.error(mn1bil?.response?.data?.error === 'cart_empty' ? 'Your cart is empty.' : 'Payment failed. Try again.');
    } finally {
      sp37h5(false);
    }
  };

  if (!ywsfq6?.items?.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        Your cart is empty. <Button variant="link" onClick={() => mcdd3r('/products')}>Shop now</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Bj175b step={w0qsjy} />

        {w0qsjy === 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Delivery address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Cjcrjb id="name" label="Full name" value={fwzkjm.name} onChange={ft69ee('name')} />
                <Cjcrjb id="phone" label="Phone" value={fwzkjm.phone} onChange={ft69ee('phone')} />
              </div>
              <Cjcrjb id="line1" label="Address line 1" value={fwzkjm.line1} onChange={ft69ee('line1')} />
              <Cjcrjb id="line2" label="Address line 2 (optional)" value={fwzkjm.line2} onChange={ft69ee('line2')} />
              <div className="grid grid-cols-3 gap-4">
                <Cjcrjb id="city" label="City" value={fwzkjm.city} onChange={ft69ee('city')} />
                <Cjcrjb id="state" label="State" value={fwzkjm.state} onChange={ft69ee('state')} />
                <Cjcrjb id="pincode" label="Pincode" value={fwzkjm.pincode} onChange={ft69ee('pincode')} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={df88as} onCheckedChange={(qv10x5) => hxp9qj(!!qv10x5)} />
                Save this address to my profile
              </label>
              <Button className="w-full" disabled={!lsx2dx} onClick={() => bysjtb(1)}>
                Continue to location
              </Button>
            </CardContent>
          </Card>
        )}

        {w0qsjy === 1 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Location-based offers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {uamjtr('location_offers') ? (
                <>
                  {shwclo ? (
                    <div className="flex items-center gap-2 rounded-md border bg-secondary p-3 text-sm">
                      <MapPin className="size-4 text-primary" />
                      Location captured: {shwclo.lat.toFixed(4)}, {shwclo.lng.toFixed(4)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Share your location to unlock offers near you. This is optional.
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button onClick={ijyl0u} disabled={j4x4s7} variant={shwclo ? 'outline' : 'default'}>
                      {j4x4s7 ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MapPin className="mr-2 size-4" />}
                      {shwclo ? 'Re-capture' : 'Use my GPS location'}
                    </Button>
                    <Button variant="ghost" onClick={() => bysjtb(2)}>
                      {shwclo ? 'Continue' : 'Skip for now'}
                    </Button>
                  </div>
                </>
              ) : (
                <Xrtvi3
                  purposeId="location_offers"
                  screen="checkout"
                  title="Use your location for nearby offers?"
                  grantLabel="Grant & capture"
                  dismissLabel="Continue without"
                  rejectOnDismiss
                  onGranted={ijyl0u}
                  onDismissed={() => bysjtb(2)}
                />
              )}
              {w0qsjy === 1 && !uamjtr('location_offers') && (
                <p className="text-xs text-muted-foreground">
                  We never read your location without consent. Choose “Continue without” to skip.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {w0qsjy === 2 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-dashed bg-secondary p-3 text-xs text-muted-foreground">
                Demo only — no real payment is processed. Enter any values.
              </div>
              <Cjcrjb id="card-number" label="Card number" value={nfauz4.number} onChange={yvl4qq('number')} placeholder="4111 1111 1111 1111" />
              <Cjcrjb id="card-name" label="Name on card" value={nfauz4.name} onChange={yvl4qq('name')} />
              <div className="grid grid-cols-2 gap-4">
                <Cjcrjb id="card-expiry" label="Expiry" value={nfauz4.expiry} onChange={yvl4qq('expiry')} placeholder="12/28" />
                <Cjcrjb id="card-cvv" label="CVV" value={nfauz4.cvv} onChange={yvl4qq('cvv')} placeholder="123" />
              </div>
              <Button className="w-full" size="lg" onClick={nxa5f9} disabled={y50olk}>
                {y50olk ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Pay {pak2w5(ywsfq6.subtotal)}
              </Button>
            </CardContent>
          </Card>
        )}

        {w0qsjy > 0 && (
          <Button variant="link" className="mt-2 px-0" onClick={() => bysjtb((krq2vs) => krq2vs - 1)}>
            ← Back
          </Button>
        )}
      </div>

      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {ywsfq6.items.map((epbj4f) => (
              <div key={epbj4f.id} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-muted-foreground">
                  {epbj4f.product.title} × {epbj4f.qty}
                </span>
                <span>{pak2w5(epbj4f.product.price * epbj4f.qty)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{pak2w5(ywsfq6.subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Bj175b({ step: wiiek2 }) {
  return (
    <div className="flex items-center gap-2">
      {F91zpn.map((hipruu, gtijgx) => (
        <div key={hipruu} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-full border text-sm font-semibold',
              gtijgx < wiiek2 && 'border-primary bg-primary text-primary-foreground',
              gtijgx === wiiek2 && 'border-primary text-primary',
              gtijgx > wiiek2 && 'text-muted-foreground'
            )}
          >
            {gtijgx < wiiek2 ? <Check className="size-4" /> : gtijgx + 1}
          </div>
          <span className={cn('text-sm', gtijgx === wiiek2 ? 'font-medium' : 'text-muted-foreground')}>{hipruu}</span>
          {gtijgx < F91zpn.length - 1 && <div className="mx-1 hidden h-px flex-1 bg-border sm:block" />}
        </div>
      ))}
    </div>
  );
}

function Cjcrjb({ id: dqj51b, label: o6lxdh, ...vtrnjb }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={dqj51b}>{o6lxdh}</Label>
      <Input id={dqj51b} {...vtrnjb} />
    </div>
  );
}
