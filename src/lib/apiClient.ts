export class HttpError extends Error {
  status: number; body?: unknown;
  constructor(message: string, status: number, body?: unknown) { super(message); this.status = status; this.body = body; }
}

export async function fetchJSON<T>(url: string, init: RequestInit = {}, { timeoutMs = 15000, retries = 1 } = {}): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal, headers: { "Accept":"application/json", ...(init.headers||{}) } });
      clearTimeout(t);
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new HttpError(`HTTP ${res.status}`, res.status, data);
      return data as T;
    } catch (e) {
      lastErr = e; if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr;
}