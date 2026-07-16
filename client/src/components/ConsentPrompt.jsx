import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldQuestion } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Reusable inline JIT consent card (design doc §6/§7). Grant posts a single-purpose
// `granted` decision; the dismiss button either posts nothing or an explicit `rejected`.
export default function ConsentPrompt({
  purposeId,
  screen,
  title,
  description,
  grantLabel = 'Grant',
  dismissLabel = 'Not now',
  rejectOnDismiss = false,
  onGranted,
  onDismissed,
  className = '',
}) {
  const { refreshConsents } = useAuth();
  const [busy, setBusy] = useState(false);

  const { data: purpose } = useQuery({
    queryKey: ['purpose-meta', purposeId],
    queryFn: async () => {
      const { data } = await api.get('/consents/purposes');
      return data.purposes.find((p) => p.purposeId === purposeId) || null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const post = async (action) => {
    await api.post('/consents/decisions', {
      decisions: [{ purposeId, action }],
      source: 'jit',
      screen,
    });
    await refreshConsents();
  };

  const onGrant = async () => {
    setBusy(true);
    try {
      await post('granted');
      onGranted?.();
    } catch {
      toast.error('Could not record your consent. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onDismiss = async () => {
    setBusy(true);
    try {
      if (rejectOnDismiss) await post('rejected');
      onDismissed?.();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={`border-primary/30 bg-accent/40 p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <ShieldQuestion className="size-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{title || purpose?.name || 'Enable this feature'}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {description || purpose?.description || 'We need your consent to use the data this feature relies on.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={onGrant} disabled={busy}>
              {grantLabel}
            </Button>
            <Button size="sm" variant="outline" onClick={onDismiss} disabled={busy}>
              {dismissLabel}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
