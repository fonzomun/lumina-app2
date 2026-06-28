import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dahnssobfwceutnshvdj.supabase.co';

const supabaseAnonKey =
  'sb_publishable_7ZmiA2xL0LI8MPFEliSxjg_G2posn7D';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);