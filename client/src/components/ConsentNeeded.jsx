import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Shown where a feature needs consent this user has not given. Consent is
// asked for in the DPDP consent screen, so the button opens "My Consents"
// rather than recording anything here.
export default function ConsentNeeded({ title, description, actionLabel = 'Manage consent' }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.DpdpConsent?.showPreferenceCenter()}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
