'use client';
import React from 'react';
import { motion } from 'motion/react';
import { Activity, CreditCard, KeyRound, Loader2, LogOut, MessageSquare, Newspaper, Server, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { getBillingPlans, BillingPlan } from '../services/billing';
import { getChatMessages, ChatMessage } from '../services/chat';
import { getNews } from '../services/news';
import { NewsItem } from '../types';
import { cn } from '../lib/utils';
import { adminLogin, clearAdminToken, getAdminSession, AdminIdentity } from '../services/admin';

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string;
};

type ProviderStatus = {
  name: string;
  status: string;
  latency?: string;
  is_backup?: boolean;
};

const initial = <T,>(data: T): LoadState<T> => ({ data, loading: true, error: '' });

const AdminPanel = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    className={cn('premium-card rounded-[32px] p-5', className)}
  >
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">{title}</p>
        {subtitle && <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{subtitle}</p>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--input)] shadow-[var(--shadow-soft)]">
        <Icon className="h-4 w-4 text-[var(--foreground)]" />
      </div>
    </div>
    {children}
  </motion.section>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--input)] p-5 text-sm font-semibold text-[var(--muted)]">
    {text}
  </div>
);

const ErrorState = ({ text }: { text: string }) => (
  <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm font-bold text-red-400">
    {text}
  </div>
);

const AdminLogin = ({ onAuthenticated }: { onAuthenticated: (admin: AdminIdentity) => void }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) return;
    setBusy(true);
    setError('');
    try {
      const session = await adminLogin(username, password);
      onAuthenticated(session.admin);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Admin login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center p-4 pb-28 sm:p-6">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card grid w-full max-w-4xl overflow-hidden rounded-[36px] p-3 md:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--foreground)] p-7 text-[var(--background)]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-8 right-8 h-28 w-28 rounded-[36px] border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--background)] text-[var(--foreground)] shadow-[var(--shadow-soft)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="mt-8 max-w-xs text-3xl font-black tracking-tight">Admin console access</h1>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-6 opacity-70">
                  Sign in with the separate admin credentials to unlock operational controls and admin-only backend permissions.
                </p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 text-xs font-bold opacity-80 backdrop-blur-xl">
                Credentials are controlled by backend environment variables and can be changed later without rebuilding the UI.
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-7">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Secure area</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Admin login</h2>
            </div>

            <label className="block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Username</label>
            <input
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              className="mt-2 h-12 w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-4 text-sm font-bold outline-none transition focus:border-[var(--primary)]"
              placeholder="Admin username"
            />

            <label className="mt-5 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Password</label>
            <input
              value={password}
              onChange={event => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-2 h-12 w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-4 text-sm font-bold outline-none transition focus:border-[var(--primary)]"
              placeholder="Admin password"
            />

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !username.trim() || !password}
              className="premium-button mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] text-sm font-black text-[var(--primary-foreground)] disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Unlock admin
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export const Admin = () => {
  const [admin, setAdmin] = React.useState<AdminIdentity | null>(null);
  const [checkingSession, setCheckingSession] = React.useState(true);
  const [providers, setProviders] = React.useState<LoadState<ProviderStatus[]>>(initial([]));
  const [plans, setPlans] = React.useState<LoadState<BillingPlan[]>>(initial([]));
  const [news, setNews] = React.useState<LoadState<NewsItem[]>>(initial([]));
  const [messages, setMessages] = React.useState<LoadState<ChatMessage[]>>(initial([]));

  React.useEffect(() => {
    getAdminSession()
      .then(session => setAdmin(session?.admin || null))
      .catch(() => {
        clearAdminToken();
        setAdmin(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  React.useEffect(() => {
    if (!admin) return;
    let alive = true;

    api.get('/api/model-health')
      .then(res => alive && setProviders({ data: res.data.providers || [], loading: false, error: '' }))
      .catch(err => alive && setProviders({ data: [], loading: false, error: err?.response?.data?.error || err?.message || 'Model health endpoint unavailable.' }));

    getBillingPlans()
      .then(data => alive && setPlans({ data, loading: false, error: '' }))
      .catch(err => alive && setPlans({ data: [], loading: false, error: err?.response?.data?.error || err?.message || 'Billing plans endpoint unavailable.' }));

    getNews()
      .then(data => alive && setNews({ data, loading: false, error: '' }))
      .catch(err => alive && setNews({ data: [], loading: false, error: err?.response?.data?.error || err?.message || 'News endpoint unavailable.' }));

    getChatMessages()
      .then(data => alive && setMessages({ data, loading: false, error: '' }))
      .catch(err => alive && setMessages({ data: [], loading: false, error: err?.response?.data?.error || err?.message || 'Chat endpoint unavailable.' }));

    return () => { alive = false; };
  }, [admin]);

  const connectedProviders = providers.data.filter(item => item.status === 'connected').length;
  const activePlans = plans.data.filter(plan => plan.active && !plan.is_custom).length;

  if (checkingSession) {
    return (
      <div className="flex-1 bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex min-h-full items-center justify-center p-6">
          <div className="premium-card flex items-center gap-3 rounded-[28px] px-5 py-4 text-sm font-black text-[var(--muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking admin session
          </div>
        </div>
      </div>
    );
  }

  if (!admin) return <AdminLogin onAuthenticated={setAdmin} />;

  const signOutAdmin = () => {
    clearAdminToken();
    setAdmin(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="mx-auto max-w-6xl space-y-6 p-4 pb-28 sm:p-6 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card overflow-hidden rounded-[36px] p-6 sm:p-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--input)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin console active
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Orbit operations</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">
                Signed in as {admin.username}. Admin-only privileges are active for operational routes.
              </p>
            </div>
            <div className="space-y-3 sm:min-w-[360px]">
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Providers', providers.loading ? '...' : `${connectedProviders}/${providers.data.length}`],
                  ['Plans', plans.loading ? '...' : String(activePlans)],
                  ['News', news.loading ? '...' : String(news.data.length)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-[var(--border)] bg-[var(--input)] px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
                    <p className="mt-1 text-xl font-black">{value}</p>
                  </div>
                ))}
              </div>
              <button onClick={signOutAdmin} className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--input)] text-xs font-black text-[var(--muted)] transition hover:text-red-500">
                <LogOut className="h-3.5 w-3.5" />
                Lock admin console
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          <AdminPanel title="AI Providers" subtitle="Backend model health" icon={Server}>
            {providers.loading ? <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" /> : providers.error ? <ErrorState text={providers.error} /> : providers.data.length === 0 ? <EmptyState text="No model providers were returned by the backend." /> : (
              <div className="space-y-2">
                {providers.data.map(provider => {
                  const online = provider.status === 'connected';
                  return (
                    <div key={provider.name} className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">{provider.name}</p>
                        <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">{provider.is_backup ? 'Fallback' : 'Primary'}{provider.latency ? ` - ${provider.latency}` : ''}</p>
                      </div>
                      <span className={cn('rounded-full px-3 py-1 text-[11px] font-black', online ? 'bg-emerald-500/12 text-emerald-500' : 'bg-red-500/12 text-red-400')}>
                        {online ? 'Online' : 'Needs key'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="Billing" subtitle="Paystack plans from backend" icon={CreditCard}>
            {plans.loading ? <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" /> : plans.error ? <ErrorState text={plans.error} /> : plans.data.length === 0 ? <EmptyState text="No billing plans were returned by the backend." /> : (
              <div className="space-y-2">
                {plans.data.map(plan => (
                  <div key={plan.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{plan.name}</p>
                      <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">{plan.interval} - {plan.ai_token_limit?.toLocaleString?.() || 'Custom'} tokens</p>
                    </div>
                    <span className={cn('rounded-full px-3 py-1 text-[11px] font-black', plan.active ? 'bg-emerald-500/12 text-emerald-500' : 'bg-[var(--accent)] text-[var(--muted)]')}>
                      {plan.active ? 'Active' : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="News Feed" subtitle="SSE-backed content source" icon={Newspaper}>
            {news.loading ? <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" /> : news.error ? <ErrorState text={news.error} /> : news.data.length === 0 ? <EmptyState text="No news articles are currently published." /> : (
              <div className="space-y-2">
                {news.data.slice(0, 5).map(item => (
                  <div key={item.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-black">{item.title}</p>
                      <span className="shrink-0 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-black text-[var(--muted)]">{item.category}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs font-medium text-[var(--muted)]">{item.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </AdminPanel>

          <AdminPanel title="Chat" subtitle="Supabase realtime message table" icon={MessageSquare}>
            {messages.loading ? <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" /> : messages.error ? <ErrorState text={messages.error} /> : messages.data.length === 0 ? <EmptyState text="No chat messages are visible to this account." /> : (
              <div className="space-y-2">
                {messages.data.slice(-5).reverse().map(message => (
                  <div key={message.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-black text-[var(--muted)]">{message.sender_id}</p>
                      <span className="shrink-0 text-[10px] font-bold text-[var(--tertiary)]">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </AdminPanel>
        </div>

        <AdminPanel title="Admin API Roadmap" subtitle="Waiting for dedicated backend endpoints" icon={Activity} className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              'Create, update, and delete news articles',
              'Search users by name, nickname, matric number, or account ID',
              'View subscription events, invoices, and Paystack webhook history',
            ].map(item => (
              <div key={item} className="rounded-[24px] border border-[var(--border)] bg-[var(--input)] p-4 text-sm font-bold text-[var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
};
