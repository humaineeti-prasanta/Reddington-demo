import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';

export default function Landing() {

  useEffect(() => {
    window.fbq?.('track', 'PageView');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-extrabold tracking-tight">
            REDDINGTON<span className="text-primary">.</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Fashion, on your terms
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Shop the latest trends — <span className="text-primary">with consent you control.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Reddington is an AJIO-style store that asks before it collects. Grant, reject or withdraw
              any data use, any time. A DPDP-compliant shopping experience end to end.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg">
                <Link to="/register">Create your account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">I already have one</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c, i) => (
              <div
                key={c}
                className="flex h-32 items-end rounded-lg border bg-background p-4 shadow-sm"
                style={{ backgroundColor: i % 2 ? '#FDEEE2' : '#FFFFFF' }}
              >
                <span className="text-lg font-semibold capitalize">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Purpose-specific consent', 'Every data use is tied to a clear purpose you approve.'],
            ['Just-in-time prompts', 'We ask exactly where a feature needs your data — never before.'],
            ['Withdraw anytime', 'Turning consent off is as easy as turning it on.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg border p-6">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
