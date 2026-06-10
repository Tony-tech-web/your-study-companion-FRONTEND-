'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Activity, CreditCard, KeyRound, Loader2, LogOut, MessageSquare,
  Newspaper, Search, Server, ShieldCheck, Trash2, Users,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  AdminIdentity,
  adminLogin,
  clearAdminToken,
  createAdminNews,
  deleteAdminNews,
  getAdminAiUsage,
  getAdminBilling,
  getAdminChats,
  getAdminNews,
  getAdminOverview,
  getAdminSession,
  getAdminUsers,
} from '../services/admin';

type LoadState<T> = { data: T; loading: boolean; error: string };
const initial = <T,>(data: T): LoadState<T> => ({ data, loading: true, error: '' });
const fmt = (value: unknown) => Number(value || 0).toLocaleString();
const naira = (kobo: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format((kobo || 0) / 100);

const Panel = ({ title, subtitle, icon: Icon, children, className }: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    className={cn('premium-card rounded-[30px] p-5', className)}
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

const Loading = () => <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />;
const Empty = ({ text }: { text: string }) => <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--input)] p-4 text-sm font-semibold text-[var(--muted)]">{text}</div>;
const ErrorBox = ({ text }: { text: string }) => <div className="rounded-[22px] border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-400">{text}</div>;

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
            <div className="absolute bottom-8 right-8 h-28 w-28 rounded-[36px] border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--background)] text-[var(--foreground)] shadow-[var(--shadow-soft)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="mt-8 max-w-xs text-3xl font-black tracking-tight">Admin console access</h1>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-6 opacity-70">
                  Use the separate backend admin credentials to unlock operational controls.
                </p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 text-xs font-bold opacity-80 backdrop-blur-xl">
                Credentials are controlled by ADMIN_USERNAME and ADMIN_PASSWORD.
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Secure area</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Admin login</h2>
            <label className="mt-7 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Username</label>
            <input value={username} onChange={event => setUsername(event.target.value)} className="mt-2 h-12 w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-4 text-sm font-bold outline-none focus:border-[var(--primary)]" />
            <label className="mt-5 block text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Password</label>
            <input value={password} onChange={event => setPassword(event.target.value)} type="password" className="mt-2 h-12 w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-4 text-sm font-bold outline-none focus:border-[var(--primary)]" />
            {error && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">{error}</div>}
            <button disabled={busy || !username.trim() || !password} className="premium-button mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] text-sm font-black text-[var(--primary-foreground)] disabled:opacity-50">
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
  const [overview, setOverview] = React.useState<LoadState<any>>(initial(null));
  const [users, setUsers] = React.useState<LoadState<any[]>>(initial([]));
  const [billing, setBilling] = React.useState<LoadState<any>>(initial(null));
  const [usage, setUsage] = React.useState<LoadState<any>>(initial(null));
  const [chats, setChats] = React.useState<LoadState<any[]>>(initial([]));
  const [news, setNews] = React.useState<LoadState<any[]>>(initial([]));
  const [query, setQuery] = React.useState('');
  const [draft, setDraft] = React.useState({ title: '', content: '', category: 'General' });
  const [savingNews, setSavingNews] = React.useState(false);

  React.useEffect(() => {
    getAdminSession()
      .then(session => setAdmin(session?.admin || null))
      .catch(() => {
        clearAdminToken();
        setAdmin(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const loadAdminData = React.useCallback(async () => {
    if (!admin) return;
    getAdminOverview().then(data => setOverview({ data, loading: false, error: '' })).catch(err => setOverview({ data: null, loading: false, error: err?.response?.data?.error || 'Overview unavailable.' }));
    getAdminUsers(query).then(data => setUsers({ data: data.users || [], loading: false, error: '' })).catch(err => setUsers({ data: [], loading: false, error: err?.response?.data?.error || 'Users unavailable.' }));
    getAdminBilling().then(data => setBilling({ data, loading: false, error: '' })).catch(err => setBilling({ data: null, loading: false, error: err?.response?.data?.error || 'Billing unavailable.' }));
    getAdminAiUsage().then(data => setUsage({ data, loading: false, error: '' })).catch(err => setUsage({ data: null, loading: false, error: err?.response?.data?.error || 'Usage unavailable.' }));
    getAdminChats().then(data => setChats({ data: data.messages || [], loading: false, error: '' })).catch(err => setChats({ data: [], loading: false, error: err?.response?.data?.error || 'Chats unavailable.' }));
    getAdminNews().then(data => setNews({ data: data.news || [], loading: false, error: '' })).catch(err => setNews({ data: [], loading: false, error: err?.response?.data?.error || 'News unavailable.' }));
  }, [admin, query]);

  React.useEffect(() => { loadAdminData(); }, [loadAdminData]);

  const publishNews = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return;
    setSavingNews(true);
    try {
      await createAdminNews(draft);
      setDraft({ title: '', content: '', category: 'General' });
      const data = await getAdminNews();
      setNews({ data: data.news || [], loading: false, error: '' });
    } finally {
      setSavingNews(false);
    }
  };

  const removeNews = async (id: string) => {
    await deleteAdminNews(id);
    setNews(state => ({ ...state, data: state.data.filter(item => item.id !== id) }));
  };

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

  const cards = [
    ['Users', overview.data?.users, Users],
    ['Revenue', naira(overview.data?.revenue_kobo || 0), CreditCard],
    ['AI tokens', overview.data?.ai_tokens, Activity],
    ['Messages', overview.data?.messages, MessageSquare],
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 lg:pb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="premium-card rounded-[36px] p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--input)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin console active
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Orbit operations</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">Signed in as {admin.username}. Admin-only backend permissions are active.</p>
            </div>
            <button onClick={signOutAdmin} className="flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--input)] px-5 text-xs font-black text-[var(--muted)] transition hover:text-red-500">
              <LogOut className="h-3.5 w-3.5" />
              Lock admin console
            </button>
          </div>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={String(label)} className="premium-card rounded-[28px] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">{String(label)}</p>
                {React.createElement(Icon as React.ElementType, { className: 'h-4 w-4 text-[var(--muted)]' })}
              </div>
              <p className="mt-3 text-2xl font-black">{typeof value === 'number' ? fmt(value) : String(value ?? '...')}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Users" subtitle="Search by name, email username, matric number, or student ID" icon={Users}>
            <div className="mb-4 flex gap-2">
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search students" className="h-11 flex-1 rounded-full border border-[var(--border)] bg-[var(--input)] px-4 text-sm font-bold outline-none" />
              <button onClick={loadAdminData} className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]"><Search className="h-4 w-4" /></button>
            </div>
            {users.loading ? <Loading /> : users.error ? <ErrorBox text={users.error} /> : users.data.length === 0 ? <Empty text="No matching users." /> : (
              <div className="max-h-[420px] space-y-2 overflow-auto pr-1 custom-scrollbar">
                {users.data.map(user => (
                  <div key={user.user_id} className="rounded-[22px] border border-[var(--border)] bg-[var(--input)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">{user.full_name || user.email_username || 'Student'}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--muted)]">{user.email} {user.matric_number ? `- ${user.matric_number}` : ''}</p>
                      </div>
                      <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-black', user.account_status === 'active' ? 'bg-emerald-500/12 text-emerald-500' : 'bg-red-500/12 text-red-400')}>{user.account_status || 'active'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="News Manager" subtitle="Create and delete admin-managed announcements" icon={Newspaper}>
            <form onSubmit={publishNews} className="space-y-3">
              <input value={draft.title} onChange={event => setDraft(v => ({ ...v, title: event.target.value }))} placeholder="Title" className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-4 text-sm font-bold outline-none" />
              <input value={draft.category} onChange={event => setDraft(v => ({ ...v, category: event.target.value }))} placeholder="Category" className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--input)] px-4 text-sm font-bold outline-none" />
              <textarea value={draft.content} onChange={event => setDraft(v => ({ ...v, content: event.target.value }))} placeholder="Announcement content" className="min-h-28 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--input)] p-4 text-sm font-bold outline-none" />
              <button disabled={savingNews || !draft.title.trim() || !draft.content.trim()} className="premium-button flex h-11 w-full items-center justify-center rounded-full bg-[var(--primary)] text-sm font-black text-[var(--primary-foreground)] disabled:opacity-50">
                {savingNews ? 'Publishing...' : 'Publish news'}
              </button>
            </form>
            <div className="mt-4 max-h-[260px] space-y-2 overflow-auto pr-1 custom-scrollbar">
              {news.loading ? <Loading /> : news.error ? <ErrorBox text={news.error} /> : news.data.length === 0 ? <Empty text="No news articles." /> : news.data.map(item => (
                <div key={item.id} className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--input)] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{item.title}</p>
                    <p className="truncate text-xs font-semibold text-[var(--muted)]">{item.category || 'General'}</p>
                  </div>
                  <button onClick={() => removeNews(item.id)} className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Billing" subtitle="Subscriptions, payments, and invoices" icon={CreditCard}>
            {billing.loading ? <Loading /> : billing.error ? <ErrorBox text={billing.error} /> : (
              <div className="space-y-3">
                <Metric label="Plans" value={billing.data?.plans?.length || 0} />
                <Metric label="Subscriptions" value={billing.data?.subscriptions?.length || 0} />
                <Metric label="Payments" value={billing.data?.payments?.length || 0} />
                <Metric label="Invoices" value={billing.data?.invoices?.length || 0} />
              </div>
            )}
          </Panel>

          <Panel title="AI Usage" subtitle="Provider token activity" icon={Server}>
            {usage.loading ? <Loading /> : usage.error ? <ErrorBox text={usage.error} /> : (
              <div className="space-y-2">
                {(usage.data?.by_provider || []).map((item: any) => (
                  <div key={item.provider} className="rounded-[20px] border border-[var(--border)] bg-[var(--input)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black">{item.provider}</p>
                      <p className="text-xs font-black text-[var(--muted)]">{fmt(item._sum?.total_tokens)} tokens</p>
                    </div>
                  </div>
                ))}
                {(usage.data?.by_provider || []).length === 0 && <Empty text="No AI usage events yet." />}
              </div>
            )}
          </Panel>

          <Panel title="Chat Monitor" subtitle="Latest campus messages" icon={MessageSquare}>
            {chats.loading ? <Loading /> : chats.error ? <ErrorBox text={chats.error} /> : chats.data.length === 0 ? <Empty text="No messages yet." /> : (
              <div className="max-h-[360px] space-y-2 overflow-auto pr-1 custom-scrollbar">
                {chats.data.slice(0, 8).map(message => (
                  <div key={message.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--input)] p-3">
                    <p className="truncate text-[11px] font-black text-[var(--muted)]">{message.sender_id}</p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--input)] p-3">
    <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{label}</span>
    <span className="text-lg font-black">{fmt(value)}</span>
  </div>
);
