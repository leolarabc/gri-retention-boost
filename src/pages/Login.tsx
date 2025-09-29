import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";

export default function Login() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Enviando link…"); setErr(null);
    try { await signInWithEmail(email); setStatus("Verifique seu e-mail para o link mágico."); }
    catch (e:any) { setErr(e.message || "Falha ao enviar link"); setStatus(null); }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Entrar</h1>
      <form onSubmit={handleEmail} className="space-y-2">
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="seu@email"
               value={email} onChange={e=>setEmail(e.target.value)} required />
        <button className="w-full border rounded px-3 py-2" type="submit">Entrar com e-mail</button>
      </form>
      <button className="w-full border rounded px-3 py-2" onClick={signInWithGoogle}>
        Entrar com Google
      </button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}