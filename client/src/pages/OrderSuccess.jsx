import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Package, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { rupees } from '@/lib/constants';
import ConsentPrompt from '@/components/ConsentPrompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderSuccess() {
  const { id } = useParams();
  const { hasConsent } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data,
  });

  if (isLoading) return <Skeleton className="mx-auto h-72 max-w-lg rounded-lg" />;
  if (!order) return <div className="p-12 text-center text-muted-foreground">Order not found.</div>;

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
            <Row label="Order ID" value={order.id} />
            <Row label="Amount paid" value={rupees(order.amount)} />
            <Row label="Payment" value={`${order.paymentStatus} · ${order.txnId}`} />
            <Row label="Expected delivery" value={new Date(order.expectedDelivery).toDateString()} />
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

      {!hasConsent('marketing_emails') && (
        <ConsentPrompt
          purposeId="marketing_emails"
          screen="order_success"
          title="Get offers on email?"
          description="Opt in to receive marketing emails about new arrivals and sales. You can withdraw anytime."
          grantLabel="Yes, keep me posted"
          dismissLabel="No thanks"
        />
      )}

      {hasConsent('marketing_emails') && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4" /> You're subscribed to Reddington offers.
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
