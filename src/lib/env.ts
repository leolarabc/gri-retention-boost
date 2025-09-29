import { z } from "zod";

const Schema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(10).optional(),
  VITE_API_BASE_URL: z.string().url().optional(),
});

const parsed = Schema.safeParse(import.meta.env);
if (!parsed.success) {
  console.error("Env inválido:", parsed.error.flatten().fieldErrors);
  throw new Error("Variáveis de ambiente inválidas. Preencha .env.local com base no .env.example");
}

export const ENV = {
  SUPABASE_URL: parsed.data.VITE_SUPABASE_URL,
  SUPABASE_ANON: parsed.data.VITE_SUPABASE_ANON_KEY,
  API_BASE_URL: parsed.data.VITE_API_BASE_URL,
};