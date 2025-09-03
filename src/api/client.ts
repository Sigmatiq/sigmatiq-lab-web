export type HttpMethod = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'
const BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api'
export const MOCK: boolean = String((import.meta as any).env?.VITE_MOCK_MODE || '').trim() === '1'

// Lightweight mock fixtures to unblock UI without backends
function delay(ms:number){ return new Promise(res=>setTimeout(res, ms)) }
function pick<T>(arr:T[], n:number){ return arr.slice(0, Math.max(0, Math.min(n, arr.length))) }
const TICKERS = ['AAPL','MSFT','GOOGL','AMZN','NVDA','META','SPY','QQQ','TSLA','AMD','NFLX','AVGO','COST','PEP','ADBE','INTC','CSCO','CRM','ORCL','SHOP']

async function mockRequest<T>(path: string, opts: { method?: HttpMethod; body?: any }): Promise<T> {
  // simulate small network jitter for realism
  await delay(120)
  const method = (opts.method||'GET').toUpperCase()
  const url = new URL(path, 'http://mock.local')
  const p = url.pathname
  const q = url.searchParams

  // Dashboard summaries
  if(method==='GET' && p==='/dashboard/summary'){
    return { data: { portfolio: { total_value: 125000, open_positions: 7 }, market: { preset_id:'sp500' } } } as any
  }
  if(method==='GET' && p==='/dashboard/activity'){
    const items = [
      { type:'screen', title:'RSI Oversold screen run', timestamp: new Date().toISOString() },
      { type:'alert', title:'MACD cross alert fired', timestamp: new Date(Date.now()-3600_000).toISOString() },
    ]
    return { data: { activities: items } } as any
  }
  if(method==='GET' && p==='/market/breadth'){
    return { advance: 312, decline: 188, highs_52w: 14, lows_52w: 5 } as any
  }
  if(method==='GET' && p==='/market/breadth/by_preset'){
    const presets = (q.get('presets')||'').split(',').map(s=>s.trim()).filter(Boolean)
    return { items: presets.map(name=>({ name, advance: Math.floor(20+Math.random()*30), decline: Math.floor(20+Math.random()*30) })) } as any
  }
  if(method==='GET' && p.startsWith('/presets/') && p.endsWith('/symbols')){
    return { symbols: pick(TICKERS, 20) } as any
  }
  if(method==='GET' && p==='/market/summary'){
    const syms = (q.get('symbols')||'').split(',').filter(Boolean)
    const data = (syms.length? syms: pick(TICKERS, q.get('cap')?Number(q.get('cap')):10)).map(s=>({
      symbol: s,
      close: Number((50+Math.random()*200).toFixed(2)),
      day_change_pct: Number(((Math.random()-0.5)*0.06).toFixed(4)),
    }))
    return { data } as any
  }

  // Morning
  if(method==='GET' && p==='/morning/pre-market'){
    return {
      data: {
        economic_calendar: [
          { time:'08:30', event:'CPI (YoY)', forecast:'3.1%' },
          { time:'10:00', event:'Consumer Sentiment', forecast:'71.0' },
        ],
        gap_analysis: {
          suggested_screen: {
            preset_id: 'sp500', timeframe:'5m', cap:25,
            name:'open_gap_z', params:{ lookback:20 },
            rule:{ column:'open_gap_z', op:'>', value:1.5 }
          }
        }
      }
    } as any
  }
  if(method==='GET' && p==='/morning/opportunities'){
    return { data: { opportunities: [
      { title:'Trend follow alignment', summary:'Stronger alignment across hourly/daily on large caps.' },
      { title:'Gap with volume confirm', summary:'Open above 1.5σ gap with OBV uptick.' },
    ] } } as any
  }
  if(method==='POST' && p==='/screen/auto'){
    const cap = Math.max(1, Math.min(Number(opts.body?.cap||10), 25))
    const matches = pick(TICKERS, cap)
    return { matched: matches, summary: `Preview: ${matches.length} matches` } as any
  }

  // Fallback
  return { ok:true } as any
}

async function request<T>(path: string, opts: { method?: HttpMethod; body?: any; headers?: Record<string,string> } = {}): Promise<T> {
  if(MOCK){
    return mockRequest<T>(path, opts)
  }
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
  if(MOCK){ return '' }
  const base = BASE.startsWith('http') ? BASE : window.location.origin
  const u = new URL(path, base)
  u.protocol = u.protocol.replace('http','ws')
  return u.toString()
}
