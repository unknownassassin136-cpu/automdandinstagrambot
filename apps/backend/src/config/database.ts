import { createClient } from '@supabase/supabase-js';
import { env } from './env';

import WebSocket from 'ws';

// We use the Supabase client primarily for Storage in the new architecture.
// Database queries are handled by Drizzle ORM.
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
    global: {
      headers: { 'x-my-custom-header': 'automd' },
    },
    realtime: {
      transport: WebSocket as any,
    }
  }
);

export async function verifyStorage() {
  // Simple check to ensure we can list buckets or connect to Supabase
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`Storage connection failed: ${error.message}`);
  }
  return data;
}
