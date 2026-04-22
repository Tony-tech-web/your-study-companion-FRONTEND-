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
  if (!token) throw new Error('No active session. Please sign in.');

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

// Get a signed URL for a private storage file
export async function getStorageUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error(error?.message || 'Failed to get file URL');
  return data.signedUrl;
}

// Download a file from storage as ArrayBuffer
export async function downloadStorageFile(bucket: string, path: string): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) throw new Error(error?.message || 'Failed to download file');
  return data.arrayBuffer();
}

// Update XP via Supabase edge function
export async function updateXP(activityType: string, incrementValue = 1) {
  try {
    await callEdgeFunction('update-user-stats', { activityType, incrementValue });
  } catch (e) {
    console.error('XP update failed:', e);
  }
}
