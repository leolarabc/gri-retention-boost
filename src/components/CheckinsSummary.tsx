import { useCheckinsCount } from "../hooks/useCheckinsCount";
import type { DateRange } from "../types";

export function CheckinsSummary({ range }: { range?: DateRange }) {
  const { count, loading, error } = useCheckinsCount(range);
  if (loading) return <span className="text-muted-foreground">Contando…</span>;
  if (error) return <span className="text-destructive">Erro: {error}</span>;
  return <span className="font-semibold">{count ?? 0}</span>;
}