import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, Lock, ShieldCheck } from 'lucide-react';

export default function ConsentOnboarding() {
  const navigate = useNavigate();
  const { consents, reconsentRequired, refreshConsents, setReconsentRequired } = useAuth();
  const reconsent = reconsentRequired;

  const [purposes, setPurposes] = useState([]);
  const [notice, setNotice] = useState(null);
  const [checked, setChecked] = useState({}); // optional purposeId -> bool
  const [showNotice, setShowNotice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get('/consents/purposes')
      .then(({ data }) => {
        if (!active) return;
        setPurposes(data.purposes);
        setNotice(data.notice);
        // Pre-fill: re-consent uses previous choices; onboarding starts unchecked.
        const initial = {};
        for (const p of data.purposes) {
          if (!p.mandatory) initial[p.purposeId] = reconsent ? consents[p.purposeId] === 'granted' : false;
        }
        setChecked(initial);
      })
      .catch(() => toast.error('Could not load consent purposes.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const optionals = useMemo(() => purposes.filter((p) => !p.mandatory), [purposes]);
  const mandatories = useMemo(() => purposes.filter((p) => p.mandatory), [purposes]);

  const source = reconsent ? 're_consent' : 'registration';

  const submit = async (decisions) => {
    setBusy(true);
    try {
      await api.post('/consents/decisions', { decisions, source, screen: 'onboarding' });
      await refreshConsents();
      setReconsentRequired(false);
      toast.success('Preferences saved.');
      navigate('/home');
    } catch {
      toast.error('Could not save your preferences.');
    } finally {
      setBusy(false);
    }
  };

  const onContinue = () => {
    const decisions = [
      ...mandatories.map((p) => ({ purposeId: p.purposeId, action: 'granted' })),
      ...optionals.map((p) => ({
        purposeId: p.purposeId,
        action: checked[p.purposeId] ? 'granted' : 'rejected',
      })),
    ];
    submit(decisions);
  };

  const onSkipOptional = () => {
    const decisions = [
      ...mandatories.map((p) => ({ purposeId: p.purposeId, action: 'granted' })),
      ...optionals.map((p) => ({ purposeId: p.purposeId, action: 'skipped' })),
    ];
    submit(decisions);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-secondary px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-primary">
            <ShieldCheck className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {reconsent ? 'Re-consent required' : 'Your privacy choices'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {reconsent ? 'We updated our privacy notice' : 'Choose how Reddington uses your data'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {reconsent
              ? 'Please review the changes and confirm your preferences to continue.'
              : 'Required purposes keep your account and orders working. Optional ones are entirely up to you.'}
          </p>
        </div>

        {notice && (
          <Card className="mb-6 p-4">
            <button
              type="button"
              onClick={() => setShowNotice((s) => !s)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-semibold">
                {notice.title} <Badge variant="secondary" className="ml-2">v{notice.version}</Badge>
              </span>
              <ChevronDown className={`size-4 transition-transform ${showNotice ? 'rotate-180' : ''}`} />
            </button>
            {showNotice && (
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{notice.content}</p>
            )}
          </Card>
        )}

        <div className="space-y-3">
          {mandatories.map((p) => (
            <PurposeRow key={p.purposeId} purpose={p} locked checked disabled />
          ))}
          <Separator className="my-2" />
          {optionals.map((p) => (
            <PurposeRow
              key={p.purposeId}
              purpose={p}
              checked={!!checked[p.purposeId]}
              onCheckedChange={(v) => setChecked((c) => ({ ...c, [p.purposeId]: !!v }))}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={onContinue} disabled={busy}>
            Continue
          </Button>
          <Button variant="outline" className="flex-1" onClick={onSkipOptional} disabled={busy}>
            Skip optional
          </Button>
        </div>
      </div>
    </div>
  );
}

function PurposeRow({ purpose, checked, onCheckedChange, locked, disabled }) {
  return (
    <Card className="flex items-start gap-3 p-4">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5"
        id={`purpose-${purpose.purposeId}`}
      />
      <label htmlFor={`purpose-${purpose.purposeId}`} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{purpose.name}</span>
          {locked ? (
            <Badge className="gap-1">
              <Lock className="size-3" /> Required
            </Badge>
          ) : (
            <Badge variant="secondary">Optional</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{purpose.description}</p>
      </label>
    </Card>
  );
}
