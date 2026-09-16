import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { ri541g } from '@/lib/vnw5tu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const urz4w0 = () => ({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });

export default function E0l8iu() {
  const s5zg51 = useQueryClient();
  const { data: abrmjm, isLoading: aglnyd } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await ri541g.get('/users/profile')).data,
  });

  const [zkn1dz, p3ko82] = useState('');
  const [fwoqvw, xp28cj] = useState('');
  const [rtv6c8, rfp2d9] = useState([]);
  const [ou8l1g, rjqccc] = useState(false);

  useEffect(() => {
    if (!abrmjm) return;
    p3ko82(abrmjm.name || '');
    xp28cj(abrmjm.phone || '');
    rfp2d9(abrmjm.addresses?.length ? abrmjm.addresses.map((rbkkjg) => ({ ...rbkkjg })) : []);
  }, [abrmjm]);

  if (aglnyd) return <Skeleton className="h-96 w-full rounded-lg" />;

  const ifu79l = (tkngz8, xvht1r, wvamiw) => rfp2d9((v6rjew) => v6rjew.map((r1f1j2, apth5z) => (apth5z === tkngz8 ? { ...r1f1j2, [xvht1r]: wvamiw } : r1f1j2)));

  const aji0xd = async () => {
    rjqccc(true);
    try {
      const s6z04r = await ri541g.put('/users/profile', { name: zkn1dz, phone: fwoqvw, addresses: rtv6c8 });
      s5zg51.setQueryData(['profile'], s6z04r.data);
      s5zg51.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated.');
    } catch {
      toast.error('Could not save profile.');
    } finally {
      rjqccc(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={zkn1dz} onChange={(k29w7p) => p3ko82(k29w7p.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={fwoqvw} onChange={(hzhkfj) => xp28cj(hzhkfj.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={abrmjm.email} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Addresses</CardTitle>
          <Button variant="outline" size="sm" onClick={() => rfp2d9((ohfn7r) => [...ohfn7r, urz4w0()])}>
            <Plus className="mr-1 size-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {rtv6c8.length === 0 && <p className="text-sm text-muted-foreground">No saved addresses.</p>}
          {rtv6c8.map((pvdq6u, q5uz3w) => (
            <div key={q5uz3w} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Address {q5uz3w + 1}</span>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => rfp2d9((akahpd) => akahpd.filter((l2oamc, a67b0l) => a67b0l !== q5uz3w))}
                  aria-label="Remove address"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Input placeholder="Address line 1" value={pvdq6u.line1} onChange={(jt9643) => ifu79l(q5uz3w, 'line1', jt9643.target.value)} />
              <Input placeholder="Address line 2 (optional)" value={pvdq6u.line2 || ''} onChange={(th3xfd) => ifu79l(q5uz3w, 'line2', th3xfd.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="City" value={pvdq6u.city} onChange={(fopphh) => ifu79l(q5uz3w, 'city', fopphh.target.value)} />
                <Input placeholder="State" value={pvdq6u.state} onChange={(fu2d9p) => ifu79l(q5uz3w, 'state', fu2d9p.target.value)} />
                <Input placeholder="Pincode" value={pvdq6u.pincode} onChange={(eofczf) => ifu79l(q5uz3w, 'pincode', eofczf.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={aji0xd} disabled={ou8l1g} size="lg">
        {ou8l1g ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  );
}
