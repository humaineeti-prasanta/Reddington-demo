import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldQuestion } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Xrtvi3({
  purposeId: pnah00,
  screen: hs3sa5,
  title: xos0yn,
  description: rirgrc,
  grantLabel: plpd5p = 'Grant',
  dismissLabel: udfeex = 'Not now',
  rejectOnDismiss: qca3gd = false,
  onGranted: vxf6wm,
  onDismissed: w871nh,
  className: ty5nxn = '',
}) {
  const { aue5rs: w1kcb8 } = useIu663q();
  const [k3ywys, bwtj7r] = useState(false);

  const { data: mjs9c5 } = useQuery({
    queryKey: ['purpose-meta', pnah00],
    queryFn: async () => {
      const { data: tbb6ba } = await ri541g.get('/consents/purposes');
      return tbb6ba.purposes.find((mxh1ad) => mxh1ad.purposeId === pnah00) || null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const ib53sj = async (lhfqba) => {
    await ri541g.post('/consents/decisions', {
      decisions: [{ purposeId: pnah00, action: lhfqba }],
      source: 'jit',
      screen: hs3sa5,
    });
    await w1kcb8();
  };

  const g02ny2 = async () => {
    bwtj7r(true);
    try {
      await ib53sj('granted');
      vxf6wm?.();
    } catch {
      toast.error('Could not record your consent. Please try again.');
    } finally {
      bwtj7r(false);
    }
  };

  const pxk2iw = async () => {
    bwtj7r(true);
    try {
      if (qca3gd) await ib53sj('rejected');
      w871nh?.();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      bwtj7r(false);
    }
  };

  return (
    <Card className={`border-primary/30 bg-accent/40 p-5 ${ty5nxn}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <ShieldQuestion className="size-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{xos0yn || mjs9c5?.name || 'Enable this feature'}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {rirgrc || mjs9c5?.description || 'We need your consent to use the data this feature relies on.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={g02ny2} disabled={k3ywys}>
              {plpd5p}
            </Button>
            <Button size="sm" variant="outline" onClick={pxk2iw} disabled={k3ywys}>
              {udfeex}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
