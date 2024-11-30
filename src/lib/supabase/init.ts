import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/supabase';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://cexwrecqxupsbtcxapip.supabase.co';
export const supabase = createClient<Database>(supabaseUrl, PUBLIC_SUPABASE_ANON_KEY);
