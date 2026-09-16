import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { pak2w5 } from '@/lib/owqm86';
import { useIowujd, useL9zga7 } from '@/hooks/aoffms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function Gbjnr8() {
  const ppegzi = useNavigate();
  const { data: dlph62, isLoading: tzoewu } = useIowujd();
  const { update: jxwlqk, remove: fpxxsj } = useL9zga7();

  if (tzoewu) return <Skeleton className="h-64 w-full rounded-lg" />;

  if (!dlph62?.items?.length) {
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
        <h1 className="text-2xl font-bold">Your Cart ({dlph62.count})</h1>
        {dlph62.items.map((dsb7oj) => (
          <Card key={dsb7oj.id} className="p-4">
            <div className="flex gap-4">
              <Link to={`/products/${dsb7oj.productId}`} className="size-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                <img src={dsb7oj.product.images?.[0]} alt={dsb7oj.product.title} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{dsb7oj.product.brand}</p>
                    <p className="font-medium">{dsb7oj.product.title}</p>
                    {dsb7oj.size && <p className="text-sm text-muted-foreground">Size: {dsb7oj.size}</p>}
                  </div>
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => fpxxsj.mutate({ productId: dsb7oj.productId, size: dsb7oj.size })}
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
                        jxwlqk.mutate({ productId: dsb7oj.productId, size: dsb7oj.size, qty: Math.max(1, dsb7oj.qty - 1) })
                      }
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{dsb7oj.qty}</span>
                    <button
                      className="p-1.5"
                      aria-label="Increase"
                      onClick={() => jxwlqk.mutate({ productId: dsb7oj.productId, size: dsb7oj.size, qty: dsb7oj.qty + 1 })}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="font-semibold">{pak2w5(dsb7oj.product.price * dsb7oj.qty)}</span>
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
            <Q1wcia label={`Subtotal (${dlph62.count} items)`} value={pak2w5(dlph62.subtotal)} />
            <Q1wcia label="Delivery" value="FREE" />
            <Separator />
            <Q1wcia label="Total" value={pak2w5(dlph62.subtotal)} bold />
            <Button className="w-full" size="lg" onClick={() => ppegzi('/checkout')}>
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Q1wcia({ label: pwwala, value: m05rgp, bold: nqy7eo }) {
  return (
    <div className={`flex items-center justify-between text-sm ${nqy7eo ? 'font-semibold' : ''}`}>
      <span className={nqy7eo ? '' : 'text-muted-foreground'}>{pwwala}</span>
      <span>{m05rgp}</span>
    </div>
  );
}
