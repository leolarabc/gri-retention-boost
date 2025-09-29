import { ENV } from "../lib/env";
import { fetchJSON } from "../lib/apiClient";
import type { Client } from "../types";

export async function getClientsHTTP(): Promise<Client[]> {
  if (!ENV.API_BASE_URL) throw new Error("VITE_API_BASE_URL não configurado");
  return fetchJSON<Client[]>(`${ENV.API_BASE_URL}/clients`);
}