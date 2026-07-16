import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck, Lock, ChevronDown, FileText, ShoppingBag, Sparkles, Bell, Mail, BarChart3, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const ICONS = {
  privacy_policy: FileText,
  order_processing: ShoppingBag,
  personalized_recommendations: Sparkles,
  promotional_notifications: Bell,
  marketing_emails: Mail,
  device_analytics: BarChart3,
  location_offers: MapPin,
};

const ACTION_COLOR = {
  granted: 'bg-green-500',
  rejected: 'bg-red-500',
  withdrawn: 'bg-red-500',
  skipped: 'bg-gray-400',
};

export default function ConsentManagement() {
  const qc = useQueryClient();
  const { consents, reconsentRequired, refreshConsents } = useAuth();
  const [showNotice, setShowNotice] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['purposes-catalog'],
    queryFn: async () => (await api.get('/consents/purposes')).data,
  });
  const { data: history } = useQuery({
    queryKey: ['consent-history'],
    queryFn: async () => (await api.get('/consents/history')).data,
  });

  const purposes = catalog?.purposes || [];
  const notice = catalog?.notice;

  const toggle = async (purpose, next) => {
    setBusyId(purpose.purposeId);
    try {
      await api.post('/consents/decisions', {
        decisions: [{ purposeId: purpose.purposeId, action: next ? 'granted' : 'withdrawn' }],
        source: 'consent_page',
        screen: 'consent_management',
      });
      await refreshConsents();
      qc.invalidateQueries({ queryKey: ['consent-history'] });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(next ? `${purpose.name} enabled.` : `${purpose.name} withdrawn.`);
    } catch {
      toast.error('Could not update your consent.');
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

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

      {/* Current state panel */}
      <Card>
        <CardHeader>
          <CardTitle>Your purposes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {purposes.map((p, i) => {
            const Icon = ICONS[p.purposeId] || FileText;
            const status = p.mandatory ? 'granted' : consents[p.purposeId];
            const on = status === 'granted';
            return (
              <div key={p.purposeId}>
                {i > 0 && <Separator className="my-1" />}
                <div className="flex items-start gap-3 py-3">
                  <div className={cn('rounded-full p-2', on ? 'bg-accent text-primary' : 'bg-secondary text-muted-foreground')}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      {p.mandatory && (
                        <Badge className="gap-1">
                          <Lock className="size-3" /> Required
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.dataCategories.map((dc) => (
                        <Badge key={dc} variant="secondary" className="text-[10px]">
                          {dc.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Switch
                    checked={on}
                    disabled={p.mandatory || busyId === p.purposeId}
                    onCheckedChange={(v) => toggle(p, v)}
                    aria-label={`Toggle ${p.name}`}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Notice panel */}
      {notice && (
        <Card>
          <CardHeader>
            <button type="button" onClick={() => setShowNotice((s) => !s)} className="flex w-full items-center justify-between text-left">
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" /> {notice.title}
                <Badge variant="secondary">v{notice.version}</Badge>
              </CardTitle>
              <ChevronDown className={cn('size-4 transition-transform', showNotice && 'rotate-180')} />
            </button>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Published {new Date(notice.publishedAt).toDateString()}
            </p>
            {showNotice && <p className="whitespace-pre-line text-sm text-muted-foreground">{notice.content}</p>}
            {reconsentRequired ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Our notice was updated. Please re-confirm your choices to keep using the app.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">You consented under version {notice.version}.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* History timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Consent history</CardTitle>
          <p className="text-sm text-muted-foreground">An append-only record of every decision you've made.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(history || []).map((e) => (
              <div key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={cn('mt-1 size-3 rounded-full', ACTION_COLOR[e.action] || 'bg-gray-400')} />
                  <span className="mt-1 w-px flex-1 bg-border" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium capitalize">{e.purposeId.replace(/_/g, ' ')}</span>
                    <Badge variant="outline" className="capitalize">{e.action}</Badge>
                    <Badge variant="secondary" className="capitalize">{e.source.replace(/_/g, ' ')}</Badge>
                    <Badge variant="secondary">{e.screen}</Badge>
                    <Badge variant="secondary">notice v{e.noticeVersion}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {!history?.length && <p className="text-sm text-muted-foreground">No history yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
