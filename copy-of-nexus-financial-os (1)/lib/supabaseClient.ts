
import { createClient } from '@supabase/supabase-js';

// Use environment variables for production security.
// In Vite, these must start with VITE_
// We safely access env to prevent crashes if import.meta.env is undefined in the runtime
const meta = import.meta as any;
const env = meta.env || {};

// Robustly handle potential double protocol typos (e.g. https:https://)
const rawUrl = env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/^(https?:)+/, 'https:');
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

// Check if keys are actually set to non-default values
export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project');

// Use placeholder if not configured to prevent crash during initialization, 
// but isSupabaseConfigured flag should be checked before making calls.
const clientUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const clientKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(clientUrl, clientKey);
