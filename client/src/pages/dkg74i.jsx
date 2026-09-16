import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Package } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { pak2w5 } from '@/lib/owqm86';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Ryple0() {
  const { data: noavx6, isLoading: a2cadq } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => (await ri541g.get('/orders')).data,
  });

  if (a2cadq) return <Skeleton className="h-64 w-full rounded-lg" />;

  if (!noavx6?.length) {
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
      {noavx6.map((sm12bx) => (
        <Card key={sm12bx.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="text-base">Order {sm12bx.id.slice(-8)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Placed {new Date(sm12bx.createdAt).toDateString()} · {pak2w5(sm12bx.amount)}
              </p>
            </div>
            <Badge variant="secondary">{pak2w5(sm12bx.amount)}</Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {sm12bx.items.map((w6cq1o) => (
                <div key={w6cq1o.id} className="flex items-center gap-2 rounded-md border bg-secondary px-3 py-2 text-sm">
                  <span className="font-medium">{w6cq1o.title}</span>
                  <span className="text-muted-foreground">× {w6cq1o.qty}{w6cq1o.size ? ` · ${w6cq1o.size}` : ''}</span>
                </div>
              ))}
            </div>
            <Cfg8mw steps={sm12bx.timeline} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Cfg8mw({ steps: omajpy }) {
  return (
    <div className="flex items-center">
      {omajpy.map((s05147, uhx9ea) => (
        <div key={s05147.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full border-2',
                s05147.reached ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'
              )}
            >
              {s05147.reached ? <Check className="size-4" /> : <span className="text-xs">{uhx9ea + 1}</span>}
            </div>
            <span className={cn('mt-1 text-xs', s05147.reached ? 'font-medium' : 'text-muted-foreground')}>{s05147.label}</span>
          </div>
          {uhx9ea < omajpy.length - 1 && (
            <div className={cn('mx-1 h-0.5 flex-1', omajpy[uhx9ea + 1].reached ? 'bg-primary' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  );
}
