import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPin, Check, CreditCard, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/hooks/commerce';
import { rupees } from '@/lib/constants';
import ConsentPrompt from '@/components/ConsentPrompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const STEPS = ['Address', 'Location', 'Payment'];

export default function Checkout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hasConsent } = useAuth();
  const { data: cart } = useCart();

  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [coords, setCoords] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [placing, setPlacing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/users/profile')).data,
  });

  useEffect(() => {
    if (!profile) return;
    const a = profile.addresses?.[0];
    setAddr((prev) => ({
      ...prev,
      name: prev.name || profile.name || '',
      phone: prev.phone || profile.phone || '',
      line1: prev.line1 || a?.line1 || '',
      line2: prev.line2 || a?.line2 || '',
      city: prev.city || a?.city || '',
      state: prev.state || a?.state || '',
      pincode: prev.pincode || a?.pincode || '',
    }));
  }, [profile]);

  const set = (k) => (e) => setAddr((s) => ({ ...s, [k]: e.target.value }));
  const setCardField = (k) => (e) => setCard((s) => ({ ...s, [k]: e.target.value }));

  const captureGps = () => {
    setCapturing(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available in this browser.');
      setCapturing(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Location captured.');
        setCapturing(false);
      },
      () => {
        toast.error('Could not read your location. You can continue without it.');
        setCapturing(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const addressValid = addr.name && addr.phone && addr.line1 && addr.city && addr.state && addr.pincode;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      if (saveToProfile) {
        await api.put('/users/profile', {
          name: addr.name,
          phone: addr.phone,
          addresses: [{ label: 'Home', line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, pincode: addr.pincode }],
        });
      }
      const { data: order } = await api.post('/orders', {
        shipping: addr,
        includeLocation: !!coords,
        locationLat: coords?.lat,
        locationLng: coords?.lng,
      });
      qc.invalidateQueries({ queryKey: ['cart'] });
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.error === 'cart_empty' ? 'Your cart is empty.' : 'Payment failed. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        Your cart is empty. <Button variant="link" onClick={() => navigate('/products')}>Shop now</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Stepper step={step} />

        {step === 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Delivery address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <F id="name" label="Full name" value={addr.name} onChange={set('name')} />
                <F id="phone" label="Phone" value={addr.phone} onChange={set('phone')} />
              </div>
              <F id="line1" label="Address line 1" value={addr.line1} onChange={set('line1')} />
              <F id="line2" label="Address line 2 (optional)" value={addr.line2} onChange={set('line2')} />
              <div className="grid grid-cols-3 gap-4">
                <F id="city" label="City" value={addr.city} onChange={set('city')} />
                <F id="state" label="State" value={addr.state} onChange={set('state')} />
                <F id="pincode" label="Pincode" value={addr.pincode} onChange={set('pincode')} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={saveToProfile} onCheckedChange={(v) => setSaveToProfile(!!v)} />
                Save this address to my profile
              </label>
              <Button className="w-full" disabled={!addressValid} onClick={() => setStep(1)}>
                Continue to location
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Location-based offers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasConsent('location_offers') ? (
                <>
                  {coords ? (
                    <div className="flex items-center gap-2 rounded-md border bg-secondary p-3 text-sm">
                      <MapPin className="size-4 text-primary" />
                      Location captured: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Share your location to unlock offers near you. This is optional.
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button onClick={captureGps} disabled={capturing} variant={coords ? 'outline' : 'default'}>
                      {capturing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MapPin className="mr-2 size-4" />}
                      {coords ? 'Re-capture' : 'Use my GPS location'}
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      {coords ? 'Continue' : 'Skip for now'}
                    </Button>
                  </div>
                </>
              ) : (
                <ConsentPrompt
                  purposeId="location_offers"
                  screen="checkout"
                  title="Use your location for nearby offers?"
                  grantLabel="Grant & capture"
                  dismissLabel="Continue without"
                  rejectOnDismiss
                  onGranted={captureGps}
                  onDismissed={() => setStep(2)}
                />
              )}
              {step === 1 && !hasConsent('location_offers') && (
                <p className="text-xs text-muted-foreground">
                  We never read your location without consent. Choose “Continue without” to skip.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
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
              <F id="card-number" label="Card number" value={card.number} onChange={setCardField('number')} placeholder="4111 1111 1111 1111" />
              <F id="card-name" label="Name on card" value={card.name} onChange={setCardField('name')} />
              <div className="grid grid-cols-2 gap-4">
                <F id="card-expiry" label="Expiry" value={card.expiry} onChange={setCardField('expiry')} placeholder="12/28" />
                <F id="card-cvv" label="CVV" value={card.cvv} onChange={setCardField('cvv')} placeholder="123" />
              </div>
              <Button className="w-full" size="lg" onClick={placeOrder} disabled={placing}>
                {placing ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Pay {rupees(cart.subtotal)}
              </Button>
            </CardContent>
          </Card>
        )}

        {step > 0 && (
          <Button variant="link" className="mt-2 px-0" onClick={() => setStep((s) => s - 1)}>
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
            {cart.items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-muted-foreground">
                  {i.product.title} × {i.qty}
                </span>
                <span>{rupees(i.product.price * i.qty)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{rupees(cart.subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-full border text-sm font-semibold',
              i < step && 'border-primary bg-primary text-primary-foreground',
              i === step && 'border-primary text-primary',
              i > step && 'text-muted-foreground'
            )}
          >
            {i < step ? <Check className="size-4" /> : i + 1}
          </div>
          <span className={cn('text-sm', i === step ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
          {i < STEPS.length - 1 && <div className="mx-1 hidden h-px flex-1 bg-border sm:block" />}
        </div>
      ))}
    </div>
  );
}

function F({ id, label, ...props }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
