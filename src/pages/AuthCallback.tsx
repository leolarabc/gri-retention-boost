import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Finalizando login…");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        setMsg(`Erro: ${error.message}`);
        return;
      }
      setMsg("Autenticado! Redirecionando…");
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      nav(next, { replace: true });
    })();
  }, [nav]);

  return <div className="p-6 text-sm">{msg}</div>;
}