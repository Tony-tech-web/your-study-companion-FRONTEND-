'use client';
import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Moon, Sun, Coffee, LogOut, ShieldCheck, CreditCard, MailCheck,
  KeyRound, Trash2, UserRound, Sparkles, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { getBillingUsage } from '../services/billing';

const themeOptions = [
  { value: 'dark', label: 'Dark', detail: 'Premium black glass', Icon: Moon },
  { value: 'light', label: 'Light', detail: 'Clean bright interface', Icon: Sun },
  { value: 'brown', label: 'Brown', detail: 'Warm dark glass', Icon: Coffee },
] as const;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="glass-panel rounded-[28px] p-5 space-y-4">
    <h2 className="text-sm font-black">{title}</h2>
    {children}
  </section>
);

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [usage, setUsage] = React.useState<any>(null);
  const [usageLoading, setUsageLoading] = React.useState(true);
  const [resetMessage, setResetMessage] = React.useState('');
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Student';

  React.useEffect(() => {
    getBillingUsage()
      .then(setUsage)
      .catch(() => setUsage(null))
      .finally(() => setUsageLoading(false));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const requestPasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setResetMessage(error ? error.message : 'Password reset email sent.');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Orbit</p>
          <h1 className="text-2xl font-black tracking-tight mt-1">Settings</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Profile, billing, security, usage, and theme controls.</p>
        </div>

        <div className="glass-panel rounded-[28px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-sm font-black">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black truncate">{displayName}</p>
            <p className="text-xs text-[var(--muted)] truncate mt-0.5">{user?.email}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-emerald-400 text-xs font-bold rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authenticated
          </div>
        </div>

        <Section title="Appearance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, detail, Icon }) => {
              const active = theme === value;
              return (
                <button key={value} onClick={() => setTheme(value)}
                  className={cn('glass-panel rounded-[24px] p-5 text-left transition-all active:scale-[0.98]',
                    active ? 'border-[var(--primary)] shadow-[var(--shadow-soft)]' : 'hover:border-[var(--primary)]/35')}>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--input)] border border-[var(--border)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[var(--foreground)]" />
                    </div>
                    <div className={cn('w-8 h-2 rounded-full', active ? 'bg-[var(--primary)]' : 'bg-[var(--border)]')} />
                  </div>
                  <p className="text-sm font-black">{label}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{detail}</p>
                </button>
              );
            })}
          </div>
        </Section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Profile">
            <div className="flex items-center gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-4">
              <UserRound className="h-5 w-5 text-[var(--muted)]" />
              <div className="min-w-0">
                <p className="text-sm font-black truncate">{displayName}</p>
                <p className="text-xs text-[var(--muted)] truncate">{user?.email}</p>
              </div>
            </div>
          </Section>

          <Section title="Payment">
            <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <p className="text-sm font-black">Billing plans</p>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">Paystack checkout with backend verification.</p>
              </div>
              <Link href="/billing" className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-black text-[var(--primary-foreground)]">
                Manage
              </Link>
            </div>
          </Section>

          <Section title="Usage">
            {usageLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-black"><Sparkles className="h-4 w-4" /> AI allowance</span>
                  <span className="text-[var(--muted)]">{usage?.ai_token_limit ? usage.ai_token_limit.toLocaleString() : 'No active plan'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black">AI interactions</span>
                  <span className="text-[var(--muted)]">{usage?.total_ai_interactions ?? 0}</span>
                </div>
                {!usage?.token_metering_enabled && (
                  <p className="rounded-2xl border border-[var(--border)] bg-[var(--input)] p-3 text-xs text-[var(--muted)]">
                    Token metering is waiting on provider-level usage telemetry. Until then, Orbit shows your plan allowance and real interaction count.
                  </p>
                )}
              </div>
            )}
          </Section>

          <Section title="Email Confirmation">
            <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-4">
              <div className="flex items-center gap-3">
                <MailCheck className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-black">{user?.email_confirmed_at ? 'Email confirmed' : 'Confirmation required'}</p>
                  <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Security">
            <div className="space-y-3">
              <button onClick={requestPasswordReset}
                className="flex w-full items-center justify-between rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-4 text-left transition-all hover:border-[var(--primary)]/35">
                <span className="flex items-center gap-3 text-sm font-black"><KeyRound className="h-5 w-5" /> Reset password</span>
              </button>
              <button disabled
                className="flex w-full cursor-not-allowed items-center justify-between rounded-[22px] border border-red-500/15 bg-red-500/5 p-4 text-left opacity-70">
                <span className="flex items-center gap-3 text-sm font-black text-red-300"><Trash2 className="h-5 w-5" /> Delete or deactivate account</span>
                <span className="text-xs text-[var(--muted)]">Admin review required</span>
              </button>
              {resetMessage && <p className="text-xs font-bold text-emerald-300">{resetMessage}</p>}
            </div>
          </Section>
        </div>

        <Section title="Authentication">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--muted)]">End the current browser session.</p>
            </div>
            <button onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-black text-red-400 hover:bg-red-500/15 transition-all active:scale-95">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
};
