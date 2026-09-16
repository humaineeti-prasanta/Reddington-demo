import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIu663q } from '@/context/adq5lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Hm12wc() {
  const { occmqy: emaedz } = useIu663q();
  const i39tna = useNavigate();
  const [ucdc5i, d82rnq] = useState({ name: '', email: '', phone: '', password: '' });
  const [tdwdgl, reoqpu] = useState(false);

  const upmlf4 = (yz46ls) => (wga79d) => d82rnq((olv4gh) => ({ ...olv4gh, [yz46ls]: wga79d.target.value }));

  const ie0ctk = async (jnwcki) => {
    jnwcki.preventDefault();
    reoqpu(true);
    try {
      await emaedz(ucdc5i);
      toast.success('Welcome to Reddington! Set your consent preferences.');
      i39tna('/consent');
    } catch (bdbxwb) {
      const dke9br = bdbxwb?.response?.data?.error;
      toast.error(dke9br === 'email_taken' ? 'That email is already registered.' : 'Registration failed.');
    } finally {
      reoqpu(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link to="/" className="text-lg font-extrabold tracking-tight">
            REDDINGTON<span className="text-primary">.</span>
          </Link>
          <CardTitle className="pt-2 text-2xl">Create your account</CardTitle>
          <CardDescription>Join Reddington in a few seconds.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={ie0ctk} className="space-y-4">
            <Rqatwh id="name" label="Full name" value={ucdc5i.name} onChange={upmlf4('name')} required />
            <Rqatwh id="email" label="Email" type="email" value={ucdc5i.email} onChange={upmlf4('email')} required />
            <Rqatwh id="phone" label="Phone" value={ucdc5i.phone} onChange={upmlf4('phone')} required />
            <Rqatwh
              id="password"
              label="Password"
              type="password"
              value={ucdc5i.password}
              onChange={upmlf4('password')}
              required
            />
            <Button type="submit" className="w-full" disabled={tdwdgl}>
              {tdwdgl ? 'Creating…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Rqatwh({ id: b8crt1, label: za5kg5, ...oiutes }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={b8crt1}>{za5kg5}</Label>
      <Input id={b8crt1} {...oiutes} />
    </div>
  );
}
