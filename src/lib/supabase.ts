import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

export const supabase =
  ENV.SUPABASE_URL && ENV.SUPABASE_ANON
    ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;