import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
	Boolean(supabaseUrl) &&
	Boolean(supabaseAnonKey) &&
	!supabaseUrl.includes('your-project') &&
	!supabaseAnonKey.includes('your_supabase_anon_key');

export const isApiConfigured = Boolean(import.meta.env.VITE_API_URL);

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey)
	: null;
