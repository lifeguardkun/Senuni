import { createClient } from '@supabase/supabase-js';

// activate supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
