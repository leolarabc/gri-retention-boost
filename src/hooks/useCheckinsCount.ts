import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DateRange } from "../types";

const CHECKINS_TABLE = "checkins";          // <-- ajuste se o nome for outro
const CHECKINS_TS_COLUMN = "created_at";    // <-- ajuste se a coluna for outra (timestamptz)

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x.toISOString(); }
function endOfDay(d: Date) { const x = new Date(d); x.setHours(23,59,59,999); return x.toISOString(); }

export function useCheckinsCount(range?: DateRange) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const f: Record<string,string> = {};
    if (range?.from) f.from = startOfDay(range.from);
    if (range?.to) f.to = endOfDay(range.to);
    return f;
  }, [range?.from?.getTime?.(), range?.to?.getTime?.()]);

  useEffect(() => {
    let off = false;
    (async () => {
      if (!supabase) { setError("Supabase não configurado"); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        let q = supabase.from(CHECKINS_TABLE).select("*", { count: "exact", head: true });
        if (filters.from) q = q.gte(CHECKINS_TS_COLUMN, filters.from);
        if (filters.to) q = q.lte(CHECKINS_TS_COLUMN, filters.to);
        const { count, error } = await q;
        if (error) throw error;
        if (!off) setCount(count ?? 0);
      } catch (e: any) {
        if (!off) setError(e?.message ?? "Falha ao contar check-ins");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [filters.from, filters.to]);

  return { count, loading, error };
}