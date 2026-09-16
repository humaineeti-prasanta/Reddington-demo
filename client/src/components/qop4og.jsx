import { useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, ShoppingCart, Search, User } from 'lucide-react';
import { useIu663q } from '@/context/adq5lu';
import { useIowujd } from '@/hooks/aoffms';
import { ri541g } from '@/lib/vnw5tu';
import { nt5smw } from '@/lib/q3wsgo';
import { Fq9bab } from '@/lib/owqm86';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function C6yjif() {
  const { user: h38rzn, qrup9w: fzvqya, j6q89t: kcbkg9 } = useIu663q();
  const { data: ktn6v2 } = useIowujd();
  const fdasvs = useNavigate();
  const gqj949 = useLocation();
  const k0ydfm = ktn6v2?.count || 0;

  const { data: h1xm3n } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => (await ri541g.get('/notifications/unread-count')).data,
    enabled: !!h38rzn,
    refetchInterval: 30000,
  });
  const mem1zn = h1xm3n?.count || 0;

  const yztko7 = kcbkg9('device_analytics');
  const eci87k = useRef(false);
  useEffect(() => {
    if (yztko7 && !eci87k.current) {
      eci87k.current = true;
      nt5smw('session_start');
    }
  }, [yztko7]);
  useEffect(() => {
    if (yztko7) nt5smw('page_view', gqj949.pathname);
  }, [gqj949.pathname, yztko7]);

  const epwha6 = (h38rzn?.name || '?')
    .split(' ')
    .map((tdnrko) => tdnrko[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const upuxhv = async () => {
    await fzvqya();
    fdasvs('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link to="/home" className="text-xl font-extrabold tracking-tight">
            REDDINGTON<span className="text-primary">.</span>
          </Link>

          <div className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for brands, products…"
              className="pl-9 bg-secondary"
              onKeyDown={(lob6qv) => {
                if (lob6qv.key === 'Enter' && lob6qv.currentTarget.value.trim()) {
                  fdasvs(`/products?search=${encodeURIComponent(lob6qv.currentTarget.value.trim())}`);
                }
              }}
            />
          </div>

          <nav className="ml-auto flex items-center gap-1">
            <Link
              to="/notifications"
              aria-label="Notifications"
              title="Notifications"
              className="relative rounded-md p-2 text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Bell className="size-5" />
              {mem1zn > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                  {mem1zn}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              title="Cart"
              className="relative rounded-md p-2 text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ShoppingCart className="size-5" />
              {k0ydfm > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                  {k0ydfm}
                </span>
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 rounded-full outline-none">
                <Avatar className="size-9 border">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    {epwha6}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{h38rzn?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => fdasvs('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => fdasvs('/orders')}>My Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => fdasvs('/wishlist')}>Wishlist</DropdownMenuItem>
                <DropdownMenuItem onClick={() => fdasvs('/consent-management')}>
                  Consent Management
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={upuxhv} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="border-t bg-background">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2">
            <Link to="/products" className="whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium hover:bg-secondary">
              All
            </Link>
            {Fq9bab.map((mg1bgb) => (
              <Link
                key={mg1bgb}
                to={`/products?category=${mg1bgb}`}
                className="whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium capitalize text-foreground/80 hover:bg-secondary"
              >
                {mg1bgb}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <User className="size-4 text-primary" /> REDDINGTON
          </div>
          <p className="mt-1">A DPDP consent-mechanics demo. Not a real store — no real payments or emails.</p>
          <Link to="/consent-management" className="mt-2 inline-block font-medium text-primary hover:underline">
            Privacy & Consent
          </Link>
        </div>
      </footer>
    </div>
  );
}

function T4o891({ to: t2atow, label: hd1s2q, children: rmbp3o }) {
  return (
    <Link
      to={t2atow}
      aria-label={hd1s2q}
      title={hd1s2q}
      className="rounded-md p-2 text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
    >
      {rmbp3o}
    </Link>
  );
}
