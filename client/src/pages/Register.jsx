import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast.success('Welcome to Reddington! Set your consent preferences.');
      navigate('/consent');
    } catch (err) {
      const code = err?.response?.data?.error;
      toast.error(code === 'email_taken' ? 'That email is already registered.' : 'Registration failed.');
    } finally {
      setBusy(false);
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
          <form onSubmit={onSubmit} className="space-y-4">
            <Field id="name" label="Full name" value={form.name} onChange={set('name')} required />
            <Field id="email" label="Email" type="email" value={form.email} onChange={set('email')} required />
            <Field id="phone" label="Phone" value={form.phone} onChange={set('phone')} required />
            <Field
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              required
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
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

function Field({ id, label, ...props }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
