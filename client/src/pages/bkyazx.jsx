import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Package, Tag } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import Xrtvi3 from '@/components/xbjsmp';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Rvhm3a() {
  const gd8ajl = useQueryClient();
  const { j6q89t: phygic } = useIu663q();

  const { data: e9jbax, isLoading: baji3v } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await ri541g.get('/notifications')).data,
  });

  const f2p5tn = useMutation({
    mutationFn: (waoglu) => ri541g.put(`/notifications/${waoglu}/read`),
    onSuccess: () => {
      gd8ajl.invalidateQueries({ queryKey: ['notifications'] });
      gd8ajl.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {!phygic('promotional_notifications') && (
        <Xrtvi3
          purposeId="promotional_notifications"
          screen="notifications"
          title="Turn on promotional notifications"
          description="Get offers and deals delivered to your notification bell. You'll still receive order updates either way."
          grantLabel="Turn on"
          onGranted={() => gd8ajl.invalidateQueries({ queryKey: ['notifications'] })}
        />
      )}

      {baji3v ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : e9jbax?.length ? (
        <div className="space-y-2">
          {e9jbax.map((l1qx63) => (
            <Card
              key={l1qx63.id}
              onClick={() => !l1qx63.read && f2p5tn.mutate(l1qx63.id)}
              className={cn(
                'flex cursor-pointer items-start gap-3 p-4 transition',
                !l1qx63.read && 'border-primary/40 bg-accent/40'
              )}
            >
              <div className={cn('rounded-full p-2', l1qx63.type === 'promo' ? 'bg-primary/10 text-primary' : 'bg-secondary')}>
                {l1qx63.type === 'promo' ? <Tag className="size-4" /> : <Package className="size-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{l1qx63.title}</span>
                  <Badge variant={l1qx63.type === 'promo' ? 'default' : 'secondary'} className="capitalize">
                    {l1qx63.type}
                  </Badge>
                  {!l1qx63.read && <span className="size-2 rounded-full bg-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{l1qx63.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(l1qx63.createdAt).toLocaleString()}</p>
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
