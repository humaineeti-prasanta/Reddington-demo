import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck, Lock, ChevronDown, FileText, ShoppingBag, Sparkles, Bell, Mail, BarChart3, MapPin } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { useIu663q } from '@/context/adq5lu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Plo66o = {
  privacy_policy: FileText,
  order_processing: ShoppingBag,
  personalized_recommendations: Sparkles,
  promotional_notifications: Bell,
  marketing_emails: Mail,
  device_analytics: BarChart3,
  location_offers: MapPin,
};

const K7mikq = {
  granted: 'bg-green-500',
  rejected: 'bg-red-500',
  withdrawn: 'bg-red-500',
  skipped: 'bg-gray-400',
};

export default function Cokb6r() {
  const cs0vm0 = useQueryClient();
  const { consents: ysuqdr, reconsentRequired: t1cb3l, aue5rs: wza90g } = useIu663q();
  const [wkf5j9, p6cyv8] = useState(false);
  const [xstqim, cvvbku] = useState(null);

  const { data: t2koi4, isLoading: piqeoc } = useQuery({
    queryKey: ['purposes-catalog'],
    queryFn: async () => (await ri541g.get('/consents/purposes')).data,
  });
  const { data: t79xew } = useQuery({
    queryKey: ['consent-history'],
    queryFn: async () => (await ri541g.get('/consents/history')).data,
  });

  const pwffli = t2koi4?.purposes || [];
  const znbm5p = t2koi4?.notice;

  const zrp5sw = async (ztjti3, b537bx) => {
    cvvbku(ztjti3.purposeId);
    try {
      await ri541g.post('/consents/decisions', {
        decisions: [{ purposeId: ztjti3.purposeId, action: b537bx ? 'granted' : 'withdrawn' }],
        source: 'consent_page',
        screen: 'consent_management',
      });
      await wza90g();
      cs0vm0.invalidateQueries({ queryKey: ['consent-history'] });
      cs0vm0.invalidateQueries({ queryKey: ['recommendations'] });
      cs0vm0.invalidateQueries({ queryKey: ['offers'] });
      cs0vm0.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(b537bx ? `${ztjti3.name} enabled.` : `${ztjti3.name} withdrawn.`);
    } catch {
      toast.error('Could not update your consent.');
    } finally {
      cvvbku(null);
    }
  };

  if (piqeoc) return <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Privacy & Consent</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold">Consent Management</h1>
        <p className="text-muted-foreground">Control exactly how Reddington uses your data. Withdraw anytime — it's one tap.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your purposes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {pwffli.map((gwo11z, idasqt) => {
            const Tswprf = Plo66o[gwo11z.purposeId] || FileText;
            const io4ywc = gwo11z.mandatory ? 'granted' : ysuqdr[gwo11z.purposeId];
            const bokeqh = io4ywc === 'granted';
            return (
              <div key={gwo11z.purposeId}>
                {idasqt > 0 && <Separator className="my-1" />}
                <div className="flex items-start gap-3 py-3">
                  <div className={cn('rounded-full p-2', bokeqh ? 'bg-accent text-primary' : 'bg-secondary text-muted-foreground')}>
                    <Tswprf className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{gwo11z.name}</span>
                      {gwo11z.mandatory && (
                        <Badge className="gap-1">
                          <Lock className="size-3" /> Required
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{gwo11z.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {gwo11z.dataCategories.map((kzdzbp) => (
                        <Badge key={kzdzbp} variant="secondary" className="text-[10px]">
                          {kzdzbp.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Switch
                    checked={bokeqh}
                    disabled={gwo11z.mandatory || xstqim === gwo11z.purposeId}
                    onCheckedChange={(kic43j) => zrp5sw(gwo11z, kic43j)}
                    aria-label={`Toggle ${gwo11z.name}`}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {znbm5p && (
        <Card>
          <CardHeader>
            <button type="button" onClick={() => p6cyv8((hq7a15) => !hq7a15)} className="flex w-full items-center justify-between text-left">
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" /> {znbm5p.title}
                <Badge variant="secondary">v{znbm5p.version}</Badge>
              </CardTitle>
              <ChevronDown className={cn('size-4 transition-transform', wkf5j9 && 'rotate-180')} />
            </button>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Published {new Date(znbm5p.publishedAt).toDateString()}
            </p>
            {wkf5j9 && <p className="whitespace-pre-line text-sm text-muted-foreground">{znbm5p.content}</p>}
            {t1cb3l ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Our notice was updated. Please re-confirm your choices to keep using the app.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">You consented under version {znbm5p.version}.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Consent history</CardTitle>
          <p className="text-sm text-muted-foreground">An append-only record of every decision you've made.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(t79xew || []).map((yghc1k) => (
              <div key={yghc1k.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn('mt-1 size-3 rounded-full', K7mikq[yghc1k.action] || 'bg-gray-400')} />
                  <span className="mt-1 w-px flex-1 bg-border" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium capitalize">{yghc1k.purposeId.replace(/_/g, ' ')}</span>
                    <Badge variant="outline" className="capitalize">{yghc1k.action}</Badge>
                    <Badge variant="secondary" className="capitalize">{yghc1k.source.replace(/_/g, ' ')}</Badge>
                    <Badge variant="secondary">{yghc1k.screen}</Badge>
                    <Badge variant="secondary">notice v{yghc1k.noticeVersion}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(yghc1k.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {!t79xew?.length && <p className="text-sm text-muted-foreground">No history yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
