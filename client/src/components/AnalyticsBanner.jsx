import { useState } from 'react';
import { toast } from 'sonner';
import { BarChart3, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// First-load device_analytics banner. Shown while status is pending/skipped;
// disappears permanently once the user grants or rejects (state from consents).
export default function AnalyticsBanner() {
  const { consents, refreshConsents } = useAuth();
  const [busy, setBusy] = useState(false);

  const status = consents['device_analytics']; // undefined (pending) | skipped | granted | rejected
  const show = status === undefined || status === 'skipped';
  if (!show) return null;

  const decide = async (action) => {
    setBusy(true);
    try {
      await api.post('/consents/decisions', {
        decisions: [{ purposeId: 'device_analytics', action }],
        source: 'jit',
        screen: 'home',
      });
      await refreshConsents();
      if (action === 'granted') toast.success('Thanks — analytics enabled.');
    } catch {
      toast.error('Could not save your choice.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-foreground text-background shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 sm:flex-row">
        <BarChart3 className="size-5 shrink-0 text-primary" />
        <p className="flex-1 text-center text-sm sm:text-left">
          <span className="font-semibold">Allow device analytics</span> to help us improve Reddington. We collect
          device info (browser, platform, screen size) — never your identity.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" onClick={() => decide('granted')} disabled={busy}>
            Allow
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-background hover:bg-background/10 hover:text-background"
            onClick={() => decide('rejected')}
            disabled={busy}
          >
            <X className="mr-1 size-4" /> No thanks
          </Button>
        </div>
      </div>
    </div>
  );
}
