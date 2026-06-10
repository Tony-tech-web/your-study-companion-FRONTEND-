'use client';
import React from 'react';
import { motion } from 'motion/react';
import { Activity, CreditCard, Loader2, MessageSquare, Newspaper, Server, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { getBillingPlans, BillingPlan } from '../services/billing';
import { getChatMessages, ChatMessage } from '../services/chat';
import { getNews } from '../services/news';
import { NewsItem } from '../types';
import { cn } from '../lib/utils';

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

export const Admin = () => {
  const [providers, setProviders] = React.useState<LoadState<ProviderStatus[]>>(initial([]));
  const [plans, setPlans] = React.useState<LoadState<BillingPlan[]>>(initial([]));
  const [news, setNews] = React.useState<LoadState<NewsItem[]>>(initial([]));
  const [messages, setMessages] = React.useState<LoadState<ChatMessage[]>>(initial([]));

  React.useEffect(() => {
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
  }, []);

  const connectedProviders = providers.data.filter(item => item.status === 'connected').length;
  const activePlans = plans.data.filter(plan => plan.active && !plan.is_custom).length;

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
                Admin console
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Orbit operations</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">
                First-pass admin surface for live system health, billing plans, news feed, and realtime chat visibility.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
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
