import { useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, ShoppingCart, Search, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/hooks/commerce';
import { api } from '@/lib/api';
import { track } from '@/lib/analytics';
import { CATEGORIES } from '@/lib/constants';
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

export default function Layout() {
  const { user, logout, hasConsent } = useAuth();
  const { data: cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cart?.count || 0;

  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data,
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unreadCount = unread?.count || 0;

  // Device analytics — client short-circuits when not consented; server enforces 403 regardless.
  const analyticsOn = hasConsent('device_analytics');
  const sessionFired = useRef(false);
  useEffect(() => {
    if (analyticsOn && !sessionFired.current) {
      sessionFired.current = true;
      track('session_start');
    }
  }, [analyticsOn]);
  useEffect(() => {
    if (analyticsOn) track('page_view', location.pathname);
  }, [location.pathname, analyticsOn]);

  const initials = (user?.name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const onLogout = async () => {
    await logout();
    navigate('/login');
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  navigate(`/products?search=${encodeURIComponent(e.currentTarget.value.trim())}`);
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
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                  {unreadCount}
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
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 rounded-full outline-none">
                <Avatar className="size-9 border">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')}>My Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/wishlist')}>Wishlist</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/consent-management')}>
                  Consent Management
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
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
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to={`/products?category=${c}`}
                className="whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium capitalize text-foreground/80 hover:bg-secondary"
              >
                {c}
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

function IconLink({ to, label, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="rounded-md p-2 text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </Link>
  );
}
