import React, { useEffect } from 'react'
import AlexLayout from '../../components/alex/Layout/AlexLayout'
import ErrorBanner from '../../components/alex/Common/ErrorBanner'
import { api, MOCK } from '../../api/client'

export default function MorningPage(){
  useEffect(()=>{ (async()=>{
    // Futures preview (best-effort): map to ETF summary for SPY/QQQ
    try{
      const sum = await api.get<any>('/market/summary?symbols=SPY,QQQ&cap=2')
      const rows: any[] = Array.isArray(sum) ? sum : (sum.data||[])
      const f = document.getElementById('futuresBody')
      if(f && rows.length){
        const html = rows.map(r=>{
          const pct = (r.day_change_pct!=null) ? `${(r.day_change_pct*100).toFixed(2)}%` : '—'
          const cls = (r.day_change_pct||0) >= 0 ? 'up' : 'down'
          return `<div>${r.symbol}: ${r.close ?? '—'} <span class="chg ${cls}">${(r.day_change_pct||0)>=0?'+':''}${pct}</span></div>`
        }).join('')
        f.innerHTML = html
      }
    }catch{}
    // Economic calendar (preview from assistant adapter)
    try{
      const res = await api.get<any>('/morning/pre-market?preset_id=sp500&cap=25')
      const d = res.data||{}
      const econEl = document.getElementById('econBody'); if(econEl){ const econ=(d.economic_calendar||[]).map((e:any)=>`<li>${e.time} — ${e.event} ${e.forecast? '('+e.forecast+')':''}</li>`).join(''); econEl.innerHTML = `<ul style='margin:0;padding-left:16px'>${econ}</ul>` }
      const gap = d.gap_analysis?.suggested_screen; const sb=document.getElementById('suggestBody'); if(sb && gap){ sb.innerHTML = `<pre style='background:#0f1a1a;border:1px solid #2a3f3f;border-radius:6px;padding:8px'>${JSON.stringify(gap, null, 2)}</pre>` }
    }catch{}
    // Overnight movers via sigma-core screener (open_gap_z)
    try{
      const body = {
        preset_id: 'sp500',
        timeframe: '5m',
        cap: 25,
        name: 'open_gap_z',
        params: { lookback: 20 },
        rule: { column: 'open_gap_z', op: '>', value: 1.5 }
      }
      const scr = await api.post<any>('/screen/auto', body)
      const list = document.getElementById('moversBody') as HTMLElement | null
      if(list){
        const rows: string[] = []
        const matches: string[] = (scr.matched || scr?.data?.matched || [])
        if(matches.length){
          rows.push('<ul class="movers-list">')
          matches.slice(0,10).forEach(sym=>{
            rows.push(`<li><span class="sym">${sym}</span><span class="chg up">gap</span></li>`)
          })
          rows.push('</ul>')
          list.innerHTML = rows.join('')
        }else{
          list.textContent = list.dataset.emptyText || 'No movers'
        }
      }
    }catch{}
  })() }, [])

  // Attach CTA click to re-run gap screen
  useEffect(()=>{
    const btn = document.getElementById('runGapCTA')
    if(!btn) return
    const run = async()=>{
      try{
        const body = {
          preset_id: 'sp500', timeframe: '5m', cap: 25,
          name: 'open_gap_z', params: { lookback: 20 },
          rule: { column: 'open_gap_z', op: '>', value: 1.5 }
        }
        const scr = await api.post<any>('/screen/auto', body)
        const list = document.getElementById('moversBody') as HTMLElement | null
        if(list){
          const matches: string[] = (scr.matched || scr?.data?.matched || [])
          if(matches.length){
            const rows: string[] = []
            rows.push('<ul class="movers-list">')
            matches.slice(0,10).forEach(sym=>{
              rows.push(`<li><span class=\"sym\">${sym}</span><span class=\"chg up\">gap</span></li>`)
            })
            rows.push('</ul>')
            list.innerHTML = rows.join('')
          }else{
            list.textContent = list.dataset.emptyText || 'No movers'
          }
        }
      }catch{}
    }
    btn.addEventListener('click', run)
    return ()=> btn.removeEventListener('click', run)
  }, [])

  useEffect(()=>{ (async()=>{
    const r = await api.get<any>('/morning/opportunities?persona=alex&limit=5')
    const items = r.data?.opportunities||[]
    const ob = document.getElementById('oppsBody'); if(ob){ ob.innerHTML = items.length ? `<ul style='margin:0;padding-left:16px'>${items.map((i:any)=>`<li>${i.title} — ${i.summary||''}</li>`).join('')}</ul>` : 'No opportunities' }
  })() }, [])

  return (
    <AlexLayout>
      <ErrorBanner />
      <div className="content">
        <div className="left-column">
          <div className="card"><div className="card-header"><div className="card-title">Futures</div><div className="card-badge preview" title="Preview only">preview</div></div><div className="card-content" id="futuresBody">Loading...</div></div>
          <div className="card"><div className="card-header"><div className="card-title">Overnight Movers</div><button id="runGapCTA" className="cta-btn" title="Run suggested screen">Run</button></div><div className="card-content" id="moversBody" data-empty-text="Run suggested gap screen.">Loading...</div></div>
          <div className="card"><div className="card-header"><div className="card-title">Economic Calendar</div><div className="card-badge preview" title="Preview only">preview</div></div><div className="card-content" id="econBody">Loading...</div></div>
          <div className="card"><div className="card-header"><div className="card-title">Suggested Action</div><div className="card-badge preview">preview</div></div><div className="card-content" id="suggestBody">Loading...</div></div>
          <div className="card"><div className="card-header"><div className="card-title">Opportunities (Persona: Alex)</div></div><div className="card-content" id="oppsBody">Loading...</div></div>
        </div>
      </div>
    </AlexLayout>
  )
}

