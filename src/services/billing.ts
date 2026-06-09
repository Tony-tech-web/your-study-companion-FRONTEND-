import api from './api';

export type BillingPlan = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: 'two_weeks' | 'monthly' | 'yearly' | 'custom';
  ai_token_limit?: number;
  provider_limits?: Record<string, number | string>;
  is_custom: boolean;
  active: boolean;
};

export const getBillingPlans = async () => {
  const { data } = await api.get('/api/billing/plans');
  return (data as { plans: BillingPlan[] }).plans;
};

export const getBillingStatus = async () => {
  const { data } = await api.get('/api/billing/status');
  return data;
};

export const getBillingUsage = async () => {
  const { data } = await api.get('/api/billing/usage');
  return data;
};

export const startBillingCheckout = async (planSlug: string, callbackUrl: string) => {
  const { data } = await api.post('/api/billing/checkout', { planSlug, callbackUrl });
  return data as { authorizationUrl: string; accessCode: string; reference: string };
};
