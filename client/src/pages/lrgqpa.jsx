import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIu663q } from '@/context/adq5lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Kkqnnv() {
  const { ydy045: giu1mj } = useIu663q();
  const gxfo6e = useNavigate();
  const [km90av, pb4vg5] = useState({ email: '', password: '' });
  const [h557fr, f9rq5p] = useState(false);

  const ysd8a8 = (zwm1f3) => (pz336r) => pb4vg5((wwns29) => ({ ...wwns29, [zwm1f3]: pz336r.target.value }));

  const kx5g7c = async (wekhsb) => {
    wekhsb.preventDefault();
    f9rq5p(true);
    try {
      const { reconsentRequired: e610x8 } = await giu1mj(km90av);
      if (e610x8) {
        toast.info('Our privacy notice was updated. Please review your consent.');
        gxfo6e('/consent');
      } else {
        gxfo6e('/home');
      }
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      f9rq5p(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link to="/" className="text-lg font-extrabold tracking-tight">
            REDDINGTON<span className="text-primary">.</span>
          </Link>
          <CardTitle className="pt-2 text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to continue shopping.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={kx5g7c} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={km90av.email} onChange={ysd8a8('email')} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={km90av.password} onChange={ysd8a8('password')} required />
            </div>
            <Button type="submit" className="w-full" disabled={h557fr}>
              {h557fr ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New to Reddington?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
