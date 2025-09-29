import { useEffect, useState } from "react";
import { ENV } from "../lib/env";
import { supabase } from "../lib/supabase";
import { getClientsHTTP } from "../services/clients";
import type { Client } from "../types";

const CLIENTS_TABLE = "members"; // <-- ajuste se o nome for outro

export function useClients() {
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let off = false;
    (async () => {
      setLoading(true); setError(null);
      console.log("ENV.API_BASE_URL:", ENV.API_BASE_URL);
      console.log("ENV.SUPABASE_URL:", ENV.SUPABASE_URL);
      console.log("supabase instance:", !!supabase);
      try {
        if (ENV.API_BASE_URL) {
          const clients = await getClientsHTTP();
          if (!off) setData(clients);
        } else {
          if (!supabase) throw new Error("Supabase não configurado e VITE_API_BASE_URL ausente");
          const { data, error } = await supabase
            .from(CLIENTS_TABLE)
            .select("id,name,email,phone,created_at")
            .order("created_at", { ascending: false })
            .limit(200);
          if (error) throw error;
          if (!off) setData((data ?? []) as Client[]);
        }
      } catch (e: any) {
        if (!off) setError(e?.message ?? "Falha ao carregar clientes");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, []);

  return { data, loading, error };
}