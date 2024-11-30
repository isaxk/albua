import type { Database } from '$lib/types/supabase';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://cexwrecqxupsbtcxapip.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleHdyZWNxeHVwc2J0Y3hhcGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MjYyNTEsImV4cCI6MjA0ODMwMjI1MX0.JHONIaNvXH1pZfjD8mtuGqQoMbU3ElAWpJoQQu8nYtk';
    
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
