import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { rupees } from '@/lib/constants';
import { useCart, useCartMutations } from '@/hooks/commerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function Cart() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { update, remove } = useCartMutations();

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  if (!cart?.items?.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link to="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-bold">Your Cart ({cart.count})</h1>
        {cart.items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex gap-4">
              <Link to={`/products/${item.productId}`} className="size-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                <img src={item.product.images?.[0]} alt={item.product.title} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{item.product.brand}</p>
                    <p className="font-medium">{item.product.title}</p>
                    {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                  </div>
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove.mutate({ productId: item.productId, size: item.size })}
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-md border">
                    <button
                      className="p-1.5"
                      aria-label="Decrease"
                      onClick={() =>
                        update.mutate({ productId: item.productId, size: item.size, qty: Math.max(1, item.qty - 1) })
                      }
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <button
                      className="p-1.5"
                      aria-label="Increase"
                      onClick={() => update.mutate({ productId: item.productId, size: item.size, qty: item.qty + 1 })}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="font-semibold">{rupees(item.product.price * item.qty)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label={`Subtotal (${cart.count} items)`} value={rupees(cart.subtotal)} />
            <Row label="Delivery" value="FREE" />
            <Separator />
            <Row label="Total" value={rupees(cart.subtotal)} bold />
            <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className={bold ? '' : 'text-muted-foreground'}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
