import { createClient } from '@supabase/supabase-js'
import type { RedemptionRequest } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Note: The database schema is a bit different from the client-side types.
// We map between them in the components.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
