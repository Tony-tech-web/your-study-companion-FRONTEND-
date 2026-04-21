import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Call a Supabase Edge Function with the current user's auth token
export async function callEdgeFunction(
  name: string,
  body: Record<string, unknown>,
  options: { stream?: boolean } = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const url = `${supabaseUrl}/functions/v1/${name}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify(body),
  });
}
