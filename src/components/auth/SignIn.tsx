import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

type Step = 'email' | 'code';

export function SignIn() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
    } else {
      setStep('code');
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.trim();
    if (token.length < 6) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: 'email',
    });
    setBusy(false);
    if (err) {
      setError(err.message);
    }
    // On success the auth state listener in useSession will flip the app
    // into the signed-in shell automatically.
  };

  return (
    <div className="mx-auto flex min-h-full max-w-sm items-center px-4">
      <div className="w-full">
        <h1 className="mb-2 text-xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {step === 'email'
            ? "Enter your email and we'll send you a 6-digit code."
            : `Enter the code we sent to ${email}.`}
        </p>

        {step === 'email' ? (
          <form onSubmit={sendCode} className="grid gap-3">
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
                disabled={busy}
              />
            </div>
            <Button type="submit" disabled={!email.trim() || busy}>
              {busy ? 'Sending…' : 'Send code'}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        ) : (
          <form onSubmit={verifyCode} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                disabled={busy}
              />
            </div>
            <Button type="submit" disabled={code.trim().length < 6 || busy}>
              {busy ? 'Verifying…' : 'Verify'}
            </Button>
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
              disabled={busy}
            >
              Use a different email
            </button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
