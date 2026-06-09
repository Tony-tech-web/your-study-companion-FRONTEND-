'use client';
import React from 'react';
import { Check, CreditCard, Loader2, LockKeyhole, ShieldCheck, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { BillingPlan, getBillingPlans, getBillingStatus, startBillingCheckout } from '../services/billing';

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);

const intervalLabel: Record<string, string> = {
  two_weeks: 'for 2 weeks',
  monthly: 'per month',
  yearly: 'per year',
  custom: 'coming soon',
};

const checkoutError = (err: any) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  'Paystack checkout could not start.';

const getBreakdown = (plan: BillingPlan) => {
  const limits = (plan.provider_limits || {}) as any;
  const marginRate = Number(limits.owner_margin_rate || 0.15);
  const base = Math.round(plan.amount / (1 + marginRate));
  const margin = Math.max(0, plan.amount - base);
  return {
    limits,
    providers: limits.providers || {},
    estimate: limits.estimate,
    marginRate,
    base,
    margin,
    total: plan.amount,
  };
};

export const Billing = () => {
  const [plans, setPlans] = React.useState<BillingPlan[]>([]);
  const [status, setStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [busyPlan, setBusyPlan] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');
  const [selectedPlan, setSelectedPlan] = React.useState<BillingPlan | null>(null);

  React.useEffect(() => {
    Promise.all([getBillingPlans(), getBillingStatus()])
      .then(([nextPlans, nextStatus]) => {
        setPlans(nextPlans);
        setStatus(nextStatus);
      })
      .catch((err) => setError(err?.response?.data?.error || 'Billing could not load right now.'))
      .finally(() => setLoading(false));
  }, []);

  const checkout = async (plan: BillingPlan) => {
    if (plan.is_custom || !plan.active) return;
    setBusyPlan(plan.slug);
    setError('');
    try {
      const callbackUrl = `${window.location.origin}/billing?payment=return`;
      const result = await startBillingCheckout(plan.slug, callbackUrl);
      window.location.href = result.authorizationUrl;
    } catch (err: any) {
      setError(checkoutError(err));
      setBusyPlan(null);
      setSelectedPlan(null);
    }
  };

  const activePlanId = status?.subscription?.plan_id;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Review plan</p>
                <h2 className="mt-1 text-2xl font-black">{selectedPlan.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{selectedPlan.description}</p>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="rounded-full border border-[var(--border)] bg-[var(--input)] p-2 text-[var(--muted)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const breakdown = getBreakdown(selectedPlan);
              return (
                <div className="mt-5 space-y-4">
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--input)] p-4">
                    {[
                      ['Plan access', formatNaira(breakdown.base)],
                      [`Owner margin (${Math.round(breakdown.marginRate * 100)}%)`, formatNaira(breakdown.margin)],
                      ['Due today', formatNaira(breakdown.total)],
                    ].map(([label, value], index) => (
                      <div key={label} className={cn('flex items-center justify-between py-2 text-sm', index === 2 && 'border-t border-[var(--border)] pt-3 text-base font-black')}>
                        <span className={index === 2 ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}>{label}</span>
                        <span className="font-black">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)] p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">AI tokens</p>
                      <p className="mt-1 text-lg font-black">{selectedPlan.ai_token_limit?.toLocaleString?.() || 'Custom'}</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)] p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Provider cost</p>
                      <p className="mt-1 text-lg font-black">${breakdown.estimate?.provider_cost_usd ?? '0.00'}</p>
                    </div>
                  </div>

                  {Object.keys(breakdown.providers).length > 0 && (
                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--input)] p-4">
                      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Provider allocation</p>
                      {Object.entries(breakdown.providers).map(([provider, config]: any) => (
                        <div key={provider} className="flex items-center justify-between py-1.5 text-xs">
                          <span className="capitalize text-[var(--muted)]">{provider}</span>
                          <span className="font-black">{Number(config.tokens || 0).toLocaleString()} tokens</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    Payment is verified by the backend before subscription access is activated.
                  </div>

                  <button
                    onClick={() => checkout(selectedPlan)}
                    disabled={busyPlan === selectedPlan.slug}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-black text-black transition active:scale-[0.98] disabled:opacity-60"
                  >
                    {busyPlan === selectedPlan.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Continue to Paystack
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[11px] font-black text-[var(--muted)]">
              <CreditCard className="h-3.5 w-3.5" />
              Paystack billing
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight">Flexible Plans for Every Stage</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Monthly, yearly, and focused sprint access for Orbit AI usage. Payments are verified on the backend before features activate.
            </p>
          </div>
          {status?.subscription && (
            <div className="glass-panel rounded-[24px] px-4 py-3 text-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Current plan</p>
              <p className="mt-1 font-black">{status.subscription.plan?.name || 'Active subscription'}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-[20px] border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="glass-panel rounded-[28px] p-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--muted)]" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const featured = plan.slug === 'monthly';
              const current = activePlanId === plan.id;
              const { limits, estimate, providers } = getBreakdown(plan);
              return (
                <article
                  key={plan.slug}
                  className={cn(
                    'glass-panel rounded-[28px] p-5 min-h-[360px] flex flex-col transition-all',
                    featured && 'border-blue-400/45 bg-blue-500/10 shadow-[0_24px_80px_rgba(77,163,255,0.18)]',
                    !plan.active && 'opacity-70'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">{plan.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{plan.description}</p>
                    </div>
                    {featured && (
                      <span className="rounded-full border border-blue-300/30 bg-blue-400/15 px-2.5 py-1 text-[10px] font-black text-blue-200">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="mt-8">
                    <p className="text-3xl font-black">{plan.is_custom ? 'Custom' : formatNaira(plan.amount)}</p>
                    <p className="mt-1 text-xs font-bold text-[var(--muted)]">{intervalLabel[plan.interval]}</p>
                  </div>

                  <button
                    onClick={() => setSelectedPlan(plan)}
                    disabled={plan.is_custom || !plan.active || busyPlan === plan.slug || current}
                    className={cn(
                      'mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition-all active:scale-[0.98]',
                      current
                        ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/25'
                        : featured
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
                      (plan.is_custom || !plan.active) && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    {busyPlan === plan.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : current ? <Check className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                    {current ? 'Active plan' : plan.is_custom ? 'Coming soon' : 'Upgrade with Paystack'}
                  </button>

                  <div className="mt-6 space-y-3 text-xs font-bold text-[var(--muted)]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[var(--foreground)]" />
                      {plan.ai_token_limit ? `${plan.ai_token_limit.toLocaleString()} AI tokens included` : 'Custom AI allowance'}
                    </div>
                    {estimate && (
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--input)] p-3 space-y-1">
                        <div className="flex justify-between gap-3">
                          <span>Provider cost</span>
                          <span>${estimate.provider_cost_usd}</span>
                        </div>
                        <div className="flex justify-between gap-3 text-[var(--foreground)]">
                          <span>Owner margin</span>
                          <span>{Math.round((limits.owner_margin_rate || 0.15) * 100)}%</span>
                        </div>
                      </div>
                    )}
                    {Object.keys(providers).length > 0 && (
                      <div className="space-y-1">
                        {Object.entries(providers).map(([provider, config]: any) => (
                          <div key={provider} className="flex justify-between gap-3">
                            <span className="capitalize">{provider}</span>
                            <span>{Number(config.tokens || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[var(--foreground)]" />
                      Research, planner, chat, and study tools access
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[var(--foreground)]" />
                      Backend verified subscription status
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
