import { z } from "zod";

const Schema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(10),
  VITE_SITE_URL: z.string().url().default("http://localhost:5173"),
  VITE_SUPABASE_REDIRECT_URL: z.string().url().optional(),
  VITE_API_BASE_URL: z.string().url().optional(),
});

console.log("Variáveis disponíveis:", Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

const parsed = Schema.safeParse(import.meta.env);
if (!parsed.success) {
  console.error("Env inválido:", parsed.error.flatten().fieldErrors);
  console.error("Dados recebidos:", import.meta.env);
  throw new Error("Variáveis de ambiente inválidas. Preencha .env.local com base no .env.example");
}

export const ENV = {
  SUPABASE_URL: parsed.data.VITE_SUPABASE_URL,
  SUPABASE_ANON: parsed.data.VITE_SUPABASE_ANON_KEY,
  SITE_URL: parsed.data.VITE_SITE_URL,
  REDIRECT_URL: parsed.data.VITE_SUPABASE_REDIRECT_URL ?? `${parsed.data.VITE_SITE_URL}/auth/callback`,
  API_BASE_URL: parsed.data.VITE_API_BASE_URL,
};