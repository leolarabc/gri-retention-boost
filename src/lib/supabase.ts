import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON, {
  auth: {
    flowType: "pkce",                 // SPA seguro
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage,
    storageKey: "gri-retention-auth",
  },
});