import { api } from '@api/client'

function html(id:string, val:string){ const el=document.getElementById(id); if(el) el.innerHTML=val }

async function loadMorning(){
  const res = await api.get<any>('/morning/pre-market?preset_id=sp500&cap=25')
  const d = res.data||{}
  html('futuresBody', `<div>SP500: ${d.futures?.sp500?.value ?? '—'} (${d.futures?.sp500?.change ?? '—'})</div>`)
  const econ = (d.economic_calendar||[]).map((e:any)=>`<li>${e.time} — ${e.event} ${e.forecast? '('+e.forecast+')':''}</li>`).join('')
  html('econBody', `<ul style='margin:0;padding-left:16px'>${econ}</ul>`)
  const gap = d.gap_analysis?.suggested_screen
  if(gap){ html('suggestBody', `<pre style='background:#0f1a1a;border:1px solid #2a3f3f;border-radius:6px;padding:8px'>${JSON.stringify(gap, null, 2)}</pre>`) }
}

async function loadOpps(){
  const r = await api.get<any>('/morning/opportunities?persona=alex&limit=5')
  const items = r.data?.opportunities||[]
  html('oppsBody', items.length ? `<ul style='margin:0;padding-left:16px'>${items.map((i:any)=>`<li>${i.title} — ${i.summary||''}</li>`).join('')}</ul>` : 'No opportunities')
}

loadMorning(); loadOpps()

