import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { rupees } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => (await api.get('/orders')).data,
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <Package className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        <Button asChild>
          <Link to="/products">Shop now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="text-base">Order {order.id.slice(-8)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Placed {new Date(order.createdAt).toDateString()} · {rupees(order.amount)}
              </p>
            </div>
            <Badge variant="secondary">{rupees(order.amount)}</Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 rounded-md border bg-secondary px-3 py-2 text-sm">
                  <span className="font-medium">{it.title}</span>
                  <span className="text-muted-foreground">× {it.qty}{it.size ? ` · ${it.size}` : ''}</span>
                </div>
              ))}
            </div>
            <Timeline steps={order.timeline} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Timeline({ steps }) {
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <div key={s.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full border-2',
                s.reached ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
              )}
            >
              {s.reached ? <Check className="size-4" /> : <span className="text-xs">{i + 1}</span>}
            </div>
            <span className={cn('mt-1 text-xs', s.reached ? 'font-medium' : 'text-muted-foreground')}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('mx-1 h-0.5 flex-1', steps[i + 1].reached ? 'bg-primary' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  );
}
