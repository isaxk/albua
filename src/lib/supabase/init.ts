import { SUPABASE_ANON_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://cexwrecqxupsbtcxapip.supabase.co';
export const supabase = createClient<Database>(supabaseUrl, SUPABASE_ANON_KEY);
