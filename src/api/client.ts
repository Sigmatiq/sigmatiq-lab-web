export type HttpMethod = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'
const BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api'
// No mock mode in production; ensure real endpoints are configured

async function request<T>(path: string, opts: { method?: HttpMethod; body?: any; headers?: Record<string,string> } = {}): Promise<T> {
  const url = `${BASE}${path}`
  const headers: Record<string,string> = { 'Content-Type': 'application/json', 'X-User-Id': 'demo', ...(opts.headers||{}) }
  const res = await fetch(url, { method: opts.method||'GET', headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : (await res.text() as any)
  if (!res.ok) throw Object.assign(new Error((data && data.error) || res.statusText), { detail: data })
  return data as T
}

export const api = {
  get:<T>(p:string)=>request<T>(p),
  post:<T>(p:string,b?:any)=>request<T>(p,{method:'POST',body:b}),
  put:<T>(p:string,b?:any)=>request<T>(p,{method:'PUT',body:b}),
  // Assistant palette + actions convenience
  paletteSearch:<T>(q:string, limit:number=20)=>request<T>(`/assistant/palette/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  actionsSpecs:<T>()=>request<T>(`/assistant/actions/specs`),
  actionsParseText:<T>(text:string)=>request<T>(`/assistant/actions/parse_text`, { method:'POST', body:{ text } }),
  actionsValidate:<T>(action:any)=>request<T>(`/assistant/actions/validate`, { method:'POST', body:{ action } }),
  actionsExecute:<T>(action:any, mode:'preview'|'run'='preview')=>request<T>(`/assistant/actions/execute`, { method:'POST', body:{ action, mode } }),
}

export function wsUrl(path: string): string {
  const base = BASE.startsWith('http') ? BASE : window.location.origin
  const u = new URL(path, base)
  u.protocol = u.protocol.replace('http','ws')
  return u.toString()
}
