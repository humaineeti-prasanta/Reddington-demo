import { useState } from 'react';
import { toast } from 'sonner';
import { BarChart3, X } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import { Button } from '@/components/ui/button';

export default function Gn9f6f() {
  const { consents: x7gnul, aue5rs: r2u9tt } = useIu663q();
  const [l2x6xl, ebblm4] = useState(false);

  const oyg5ym = x7gnul['device_analytics'];
  const k1nvau = oyg5ym === undefined || oyg5ym === 'skipped';
  if (!k1nvau) return null;

  const d6jjnx = async (w0l734) => {
    ebblm4(true);
    try {
      await ri541g.post('/consents/decisions', {
        decisions: [{ purposeId: 'device_analytics', action: w0l734 }],
        source: 'jit',
        screen: 'home',
      });
      await r2u9tt();
      if (w0l734 === 'granted') toast.success('Thanks — analytics enabled.');
    } catch {
      toast.error('Could not save your choice.');
    } finally {
      ebblm4(false);
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
          <Button size="sm" onClick={() => d6jjnx('granted')} disabled={l2x6xl}>
            Allow
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-background hover:bg-background/10 hover:text-background"
            onClick={() => d6jjnx('rejected')}
            disabled={l2x6xl}
          >
            <X className="mr-1 size-4" /> No thanks
          </Button>
        </div>
      </div>
    </div>
  );
}
