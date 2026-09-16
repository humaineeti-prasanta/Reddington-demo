import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, Lock, ShieldCheck } from 'lucide-react';

export default function It53wl() {
  const zwbe4a = useNavigate();
  const { consents: h5kj9i, reconsentRequired: eduyw1, aue5rs: hsmoj8, ou1czr: obho8f } = useIu663q();
  const n88am4 = eduyw1;

  const [hn6vac, paf67i] = useState([]);
  const [i7fw1q, r2blec] = useState(null);
  const [df7y8d, pzzmd6] = useState({});
  const [r385tz, kbahq8] = useState(false);
  const [pg63bd, zghnby] = useState(true);
  const [rzlblf, tkr8xn] = useState(false);

  useEffect(() => {
    let sykp7l = true;
    ri541g
      .get('/consents/purposes')
      .then(({ data: q0pdoa }) => {
        if (!sykp7l) return;
        paf67i(q0pdoa.purposes);
        r2blec(q0pdoa.notice);
        const ltcsf7 = {};
        for (const vcexoa of q0pdoa.purposes) {
          if (!vcexoa.mandatory) ltcsf7[vcexoa.purposeId] = n88am4 ? h5kj9i[vcexoa.purposeId] === 'granted' : false;
        }
        pzzmd6(ltcsf7);
      })
      .catch(() => toast.error('Could not load consent purposes.'))
      .finally(() => sykp7l && zghnby(false));
    return () => {
      sykp7l = false;
    };
  }, []);

  const hsvm8o = useMemo(() => hn6vac.filter((h42x6v) => !h42x6v.mandatory), [hn6vac]);
  const e282e9 = useMemo(() => hn6vac.filter((e2encb) => e2encb.mandatory), [hn6vac]);

  const ztn1q8 = n88am4 ? 're_consent' : 'registration';

  const qnw3ra = async (x32gnd) => {
    tkr8xn(true);
    try {
      await ri541g.post('/consents/decisions', { decisions: x32gnd, source: ztn1q8, screen: 'onboarding' });
      await hsmoj8();
      obho8f(false);
      toast.success('Preferences saved.');
      zwbe4a('/home');
    } catch {
      toast.error('Could not save your preferences.');
    } finally {
      tkr8xn(false);
    }
  };

  const v64kvt = () => {
    const uhjrbl = [
      ...e282e9.map((exhrto) => ({ purposeId: exhrto.purposeId, action: 'granted' })),
      ...hsvm8o.map((yptr46) => ({
        purposeId: yptr46.purposeId,
        action: df7y8d[yptr46.purposeId] ? 'granted' : 'rejected',
      })),
    ];
    qnw3ra(uhjrbl);
  };

  const ox5cgk = () => {
    const ruzj7w = [
      ...e282e9.map((aoxgsg) => ({ purposeId: aoxgsg.purposeId, action: 'granted' })),
      ...hsvm8o.map((fkljix) => ({ purposeId: fkljix.purposeId, action: 'skipped' })),
    ];
    qnw3ra(ruzj7w);
  };

  if (pg63bd) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-secondary px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-primary">
            <ShieldCheck className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {n88am4 ? 'Re-consent required' : 'Your privacy choices'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {n88am4 ? 'We updated our privacy notice' : 'Choose how Reddington uses your data'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {n88am4
              ? 'Please review the changes and confirm your preferences to continue.'
              : 'Required purposes keep your account and orders working. Optional ones are entirely up to you.'}
          </p>
        </div>

        {i7fw1q && (
          <Card className="mb-6 p-4">
            <button
              type="button"
              onClick={() => kbahq8((pnbu8n) => !pnbu8n)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-semibold">
                {i7fw1q.title} <Badge variant="secondary" className="ml-2">v{i7fw1q.version}</Badge>
              </span>
              <ChevronDown className={`size-4 transition-transform ${r385tz ? 'rotate-180' : ''}`} />
            </button>
            {r385tz && (
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{i7fw1q.content}</p>
            )}
          </Card>
        )}

        <div className="space-y-3">
          {e282e9.map((xh10a1) => (
            <P5i010 key={xh10a1.purposeId} purpose={xh10a1} locked checked disabled />
          ))}
          <Separator className="my-2" />
          {hsvm8o.map((n98p99) => (
            <P5i010
              key={n98p99.purposeId}
              purpose={n98p99}
              checked={!!df7y8d[n98p99.purposeId]}
              onCheckedChange={(b6rs6l) => pzzmd6((mjjrpu) => ({ ...mjjrpu, [n98p99.purposeId]: !!b6rs6l }))}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={v64kvt} disabled={rzlblf}>
            Continue
          </Button>
          <Button variant="outline" className="flex-1" onClick={ox5cgk} disabled={rzlblf}>
            Skip optional
          </Button>
        </div>
      </div>
    </div>
  );
}

function P5i010({ purpose: brdcul, checked: ef5spn, onCheckedChange: e96wmg, locked: hb60bo, disabled: r5nh3a }) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <Checkbox
        checked={ef5spn}
        onCheckedChange={e96wmg}
        disabled={r5nh3a}
        className="mt-0.5"
        id={`purpose-${brdcul.purposeId}`}
      />
      <label htmlFor={`purpose-${brdcul.purposeId}`} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{brdcul.name}</span>
          {hb60bo ? (
            <Badge className="gap-1">
              <Lock className="size-3" /> Required
            </Badge>
          ) : (
            <Badge variant="secondary">Optional</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{brdcul.description}</p>
      </label>
    </Card>
  );
}
