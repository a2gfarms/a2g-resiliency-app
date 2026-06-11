import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client. With static export there is no server — auth and
// data access run in the browser under row-level security with the anon key.
// If env isn't configured (e.g. a build without keys), the app degrades to the
// Phase-1 no-account experience instead of crashing.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
