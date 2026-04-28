import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (err) {
      setStatus('error');
      setError(err.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="mx-auto flex min-h-full max-w-sm items-center px-4">
      <div className="w-full">
        <h1 className="mb-2 text-xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a magic link.
        </p>

        {status === 'sent' ? (
          <div className="rounded-lg border border-border/60 bg-secondary/20 p-4 text-sm">
            Check <span className="font-medium">{email}</span> for a sign-in link. You can close this
            tab — opening the link will return you here signed in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending'}
              />
            </div>
            <Button type="submit" disabled={!email.trim() || status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
