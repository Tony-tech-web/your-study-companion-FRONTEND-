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
import { deactivateAccount, deleteAccount } from '../services/account';

const themeOptions = [
  { value: 'dark', label: 'Dark', detail: 'Premium black glass', Icon: Moon },
  { value: 'light', label: 'Light', detail: 'Clean bright interface', Icon: Sun },
  { value: 'brown', label: 'Brown', detail: 'Warm dark glass', Icon: Coffee },
] as const;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="glass-panel rounded-[22px] p-3.5 space-y-3">
    <h2 className="text-[12px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">{title}</h2>
    {children}
  </section>
);

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [usage, setUsage] = React.useState<any>(null);
  const [usageLoading, setUsageLoading] = React.useState(true);
  const [usageError, setUsageError] = React.useState('');
  const [resetMessage, setResetMessage] = React.useState('');
  const [securityBusy, setSecurityBusy] = React.useState(false);
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Student';
  const avatarUrl = (user?.user_metadata?.avatar_url as string) || (user?.user_metadata?.picture as string) || '';

  const loadUsage = React.useCallback(() => {
    let alive = true;
    setUsageLoading(true);
    setUsageError('');

    const usageTimeout = new Promise<{ timedOut: true }>((resolve) => {
      window.setTimeout(() => resolve({ timedOut: true }), 8000);
    });

    Promise.race([getBillingUsage(), usageTimeout])
      .then((next: any) => {
        if (!alive) return;
        if (next?.timedOut) {
          setUsage(null);
          setUsageError('Usage is taking longer than expected. Check the backend billing usage endpoint.');
          return;
        }
        setUsage(next);
      })
      .catch((err) => {
        if (!alive) return;
        setUsage(null);
        setUsageError(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Usage could not load right now.');
      })
      .finally(() => {
        if (alive) setUsageLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    return loadUsage();
  }, [loadUsage]);

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

  const handleDeactivate = async () => {
    if (!window.confirm('Deactivate your Orbit account on this profile? You can sign back in later to reactivate.')) return;
    setSecurityBusy(true);
    try {
      await deactivateAccount();
      await signOut();
      router.push('/login');
    } finally {
      setSecurityBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete your Orbit account and app data? This cannot be undone.')) return;
    setSecurityBusy(true);
    try {
      await deleteAccount();
      await signOut();
      router.push('/login');
    } finally {
      setSecurityBusy(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-4xl mx-auto p-4 sm:p-5 space-y-4 pb-28 lg:pb-6">
        <div className="pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Orbit</p>
          <h1 className="text-xl font-black tracking-tight mt-1">Settings</h1>
          <p className="text-xs text-[var(--muted)] mt-1">Profile, billing, security, usage, and theme controls.</p>
        </div>

        <div className="glass-panel overflow-hidden rounded-[30px] p-0">
          <div className="h-24 border-b border-[var(--border)] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,var(--input),var(--card))]" />
          <div className="px-4 pb-4">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border-4 border-[var(--background)] bg-[var(--primary)] text-lg font-black text-[var(--primary-foreground)] shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="truncate text-xl font-black">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-[var(--muted)]">{user?.email}</p>
                </div>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-black text-emerald-300 sm:flex-none">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Authenticated
                </div>
                <Link href="/billing" className="flex flex-1 items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2 text-[11px] font-black text-[var(--primary-foreground)] sm:flex-none">
                  Billing
                </Link>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)] px-3 py-2">
                <p className="text-[10px] font-black uppercase text-[var(--muted)]">Theme</p>
                <p className="mt-1 truncate text-sm font-black capitalize">{theme || 'System'}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)] px-3 py-2">
                <p className="text-[10px] font-black uppercase text-[var(--muted)]">Tokens</p>
                <p className="mt-1 truncate text-sm font-black">{usageLoading ? 'Syncing' : usage?.tokens_remaining === null ? 'Plan' : usage?.tokens_remaining?.toLocaleString?.() ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)] px-3 py-2">
                <p className="text-[10px] font-black uppercase text-[var(--muted)]">Email</p>
                <p className="mt-1 truncate text-sm font-black">{user?.email_confirmed_at ? 'Verified' : 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>

        <Section title="Appearance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, detail, Icon }) => {
              const active = theme === value;
              return (
                <button key={value} onClick={() => setTheme(value)}
                  className={cn('glass-panel rounded-2xl p-3 text-left transition-all active:scale-[0.98]',
                    active ? 'border-[var(--primary)] shadow-[var(--shadow-soft)]' : 'hover:border-[var(--primary)]/35')}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--input)] border border-[var(--border)] flex items-center justify-center">
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

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Profile">
            <div className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--input)] p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]">
                <UserRound className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black truncate">{displayName}</p>
                <p className="text-xs text-[var(--muted)] truncate">{user?.email}</p>
              </div>
            </div>
          </Section>

          <Section title="Payment">
            <div className="flex items-center justify-between gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--input)] p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <p className="text-sm font-black">Billing plans</p>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">Review AI allowance, provider allocation, and margin before Paystack checkout.</p>
              </div>
              <Link href="/billing" className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-black text-[var(--primary-foreground)]">
                Manage
              </Link>
            </div>
          </Section>

          <Section title="Usage">
            {usageLoading ? (
              <div className="flex min-h-24 items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--input)] p-4">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />
                <div>
                  <p className="text-sm font-black">Syncing usage</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Checking backend allowance and provider totals.</p>
                </div>
              </div>
            ) : usageError ? (
              <div className="rounded-[20px] border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-xs font-bold text-red-300">{usageError}</p>
                <button
                  onClick={loadUsage}
                  className="mt-3 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-black text-[var(--primary-foreground)]"
                >
                  Retry usage
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 font-black"><Sparkles className="h-4 w-4" /> AI allowance</span>
                  <span className="text-[var(--muted)]">{usage?.ai_token_limit ? usage.ai_token_limit.toLocaleString() : 'No active plan'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black">Tokens used</span>
                  <span className="text-[var(--muted)]">{usage?.tokens_used?.toLocaleString?.() ?? 0}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black">Tokens remaining</span>
                  <span className="text-[var(--muted)]">{usage?.tokens_remaining === null ? 'Plan required' : usage?.tokens_remaining?.toLocaleString?.() ?? 0}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black">AI interactions</span>
                  <span className="text-[var(--muted)]">{usage?.total_ai_interactions ?? 0}</span>
                </div>
                {usage?.usage?.cost && (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black">Provider cost</span>
                      <span className="text-[var(--muted)]">${usage.usage.cost.provider_cost_usd?.toFixed?.(4) ?? usage.usage.cost.provider_cost_usd}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black">Owner margin</span>
                      <span className="text-[var(--muted)]">${usage.usage.cost.margin_usd?.toFixed?.(4) ?? usage.usage.cost.margin_usd}</span>
                    </div>
                  </>
                )}
                {usage?.usage?.by_provider && Object.keys(usage.usage.by_provider).length > 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)] p-3 text-xs text-[var(--muted)]">
                    {Object.entries(usage.usage.by_provider).map(([provider, item]: any) => (
                      <div key={provider} className="flex justify-between gap-3 py-1">
                        <span>{provider}</span>
                        <span>{item.tokens.toLocaleString()} tokens - ${item.cost?.billable_cost_usd?.toFixed?.(4) ?? '0.0000'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>

          <Section title="Email Confirmation">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--input)] p-3">
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
                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--input)] p-3 text-left transition-all hover:border-[var(--primary)]/35">
                <span className="flex items-center gap-3 text-sm font-black"><KeyRound className="h-5 w-5" /> Reset password</span>
              </button>
              <button disabled={securityBusy} onClick={handleDeactivate}
                className="flex w-full items-center justify-between rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3 text-left transition hover:bg-orange-500/10 disabled:opacity-60">
                <span className="flex items-center gap-3 text-sm font-black text-orange-200"><Trash2 className="h-5 w-5" /> Deactivate account</span>
                <span className="text-xs text-[var(--muted)]">Pause profile</span>
              </button>
              <button disabled={securityBusy} onClick={handleDelete}
                className="flex w-full items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-3 text-left transition hover:bg-red-500/10 disabled:opacity-60">
                <span className="flex items-center gap-3 text-sm font-black text-red-300"><Trash2 className="h-5 w-5" /> Delete account</span>
                <span className="text-xs text-[var(--muted)]">Permanent</span>
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
