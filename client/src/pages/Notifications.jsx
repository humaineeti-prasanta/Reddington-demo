import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Package, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { useSdkConsent } from '@/hooks/useSdkConsent';
import ConsentNeeded from '@/components/ConsentNeeded';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const qc = useQueryClient();
  const { granted: promoNotifications } = useSdkConsent('promotional_notifications');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {!promoNotifications && (
        <ConsentNeeded
          title="Turn on promotional notifications"
          description="Get offers and deals in your notification bell. You'll still receive order updates either way."
          actionLabel="Turn on"
        />
      )}

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : notifications?.length ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={cn(
                'flex cursor-pointer items-start gap-3 p-4 transition',
                !n.read && 'border-primary/40 bg-accent/40'
              )}
            >
              <div className={cn('rounded-full p-2', n.type === 'promo' ? 'bg-primary/10 text-primary' : 'bg-secondary')}>
                {n.type === 'promo' ? <Tag className="size-4" /> : <Package className="size-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{n.title}</span>
                  <Badge variant={n.type === 'promo' ? 'default' : 'secondary'} className="capitalize">
                    {n.type}
                  </Badge>
                  {!n.read && <span className="size-2 rounded-full bg-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <Bell className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      )}
    </div>
  );
}
