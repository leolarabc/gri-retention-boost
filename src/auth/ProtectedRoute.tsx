import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-6 text-sm">Carregando sessão…</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname+loc.search)}`} replace />;
  return children;
}