import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const emptyAddress = () => ({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });

export default function Profile() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/users/profile')).data,
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setAddresses(profile.addresses?.length ? profile.addresses.map((a) => ({ ...a })) : []);
  }, [profile]);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-lg" />;

  const updateAddr = (i, k, v) => setAddresses((arr) => arr.map((a, idx) => (idx === i ? { ...a, [k]: v } : a)));

  const save = async () => {
    setSaving(true);
    try {
      const data = await api.put('/users/profile', { name, phone, addresses });
      qc.setQueryData(['profile'], data.data);
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated.');
    } catch {
      toast.error('Could not save profile.');
    } finally {
      setSaving(false);
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
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={profile.email} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Addresses</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setAddresses((a) => [...a, emptyAddress()])}>
            <Plus className="mr-1 size-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length === 0 && <p className="text-sm text-muted-foreground">No saved addresses.</p>}
          {addresses.map((a, i) => (
            <div key={i} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Address {i + 1}</span>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setAddresses((arr) => arr.filter((_, idx) => idx !== i))}
                  aria-label="Remove address"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Input placeholder="Address line 1" value={a.line1} onChange={(e) => updateAddr(i, 'line1', e.target.value)} />
              <Input placeholder="Address line 2 (optional)" value={a.line2 || ''} onChange={(e) => updateAddr(i, 'line2', e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="City" value={a.city} onChange={(e) => updateAddr(i, 'city', e.target.value)} />
                <Input placeholder="State" value={a.state} onChange={(e) => updateAddr(i, 'state', e.target.value)} />
                <Input placeholder="Pincode" value={a.pincode} onChange={(e) => updateAddr(i, 'pincode', e.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} size="lg">
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  );
}
