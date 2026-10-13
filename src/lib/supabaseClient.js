import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mkyckyccjglwkmiwteqy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-6TGNXDH6BjHL5sCiQvxBA_6h-uSvU3";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
