import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for user-authenticated requests (uses RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for service role (bypasses RLS, use with caution)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Export types
export * from './types';
