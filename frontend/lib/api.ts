const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') : 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('crm_token');
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(opts.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path: string, body?: any) { return apiFetch(path, { method: 'POST', body: JSON.stringify(body) }); }
export async function apiGet(path: string) { return apiFetch(path); }
export async function apiPut(path: string, body?: any) { return apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }); }
export async function apiDelete(path: string) { return apiFetch(path, { method: 'DELETE' }); }
