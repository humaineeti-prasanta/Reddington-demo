import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Package, Mail } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import { pak2w5 } from '@/lib/owqm86';
import Xrtvi3 from '@/components/xbjsmp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Kup6cr() {
  const { id: ec4au9 } = useParams();
  const { j6q89t: t2p2j0 } = useIu663q();

  const { data: jlll7d, isLoading: qzgrvl } = useQuery({
    queryKey: ['order', ec4au9],
    queryFn: async () => (await ri541g.get(`/orders/${ec4au9}`)).data,
  });

  if (qzgrvl) return <Skeleton className="mx-auto h-72 max-w-lg rounded-lg" />;
  if (!jlll7d) return <div className="p-12 text-center text-muted-foreground">Order not found.</div>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="border-primary/20 text-center">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <CheckCircle2 className="size-8" />
          </div>
          <CardTitle className="text-2xl">Order placed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">Thank you for shopping with Reddington.</p>
          <div className="space-y-2 rounded-lg border bg-secondary p-4 text-left text-sm">
            <P9kvoa label="Order ID" value={jlll7d.id} />
            <P9kvoa label="Amount paid" value={pak2w5(jlll7d.amount)} />
            <P9kvoa label="Payment" value={`${jlll7d.paymentStatus} · ${jlll7d.txnId}`} />
            <P9kvoa label="Expected delivery" value={new Date(jlll7d.expectedDelivery).toDateString()} />
          </div>
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/orders">
                <Package className="mr-2 size-4" /> Track order
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/home">Continue shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {!t2p2j0('marketing_emails') && (
        <Xrtvi3
          purposeId="marketing_emails"
          screen="order_success"
          title="Get offers on email?"
          description="Opt in to receive marketing emails about new arrivals and sales. You can withdraw anytime."
          grantLabel="Yes, keep me posted"
          dismissLabel="No thanks"
        />
      )}

      {t2p2j0('marketing_emails') && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4" /> You're subscribed to Reddington offers.
        </div>
      )}
    </div>
  );
}

function P9kvoa({ label: ixa2d8, value: lbiafu }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{ixa2d8}</span>
      <span className="font-medium">{lbiafu}</span>
    </div>
  );
}
