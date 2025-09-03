import React, { useEffect } from 'react'
import AlexLayout from '../../components/alex/Layout/AlexLayout'
import ErrorBanner from '../../components/alex/Common/ErrorBanner'
import MarketSentimentCard from '../../components/alex/Cards/MarketSentimentCard'
import SectorRotationCard from '../../components/alex/Cards/SectorRotationCard'
import TopMoversCard from '../../components/alex/Cards/TopMoversCard'
import VolumeHeatZonesCard from '../../components/alex/Cards/VolumeHeatZonesCard'
import { api, wsUrl } from '../../api/client'

export default function DashboardPage(){
  useEffect(()=>{
    const clock = setInterval(()=>{
      const el = document.getElementById('timeDisplay');
      if(el){ el.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }
    }, 1000)
    return ()=> clearInterval(clock)
  },[])

  useEffect(()=>{
    // Portfolio + market summary banner
    (async()=>{
      try{
        const res = await api.get<any>('/dashboard/summary')
        const p = res.data?.portfolio || {}
        const pb = document.getElementById('portfolioBody'); if(pb) pb.innerHTML = `<div>Total Equity: ${p.total_value ?? '—'}</div><div>Open Positions: ${p.open_positions ?? 0}</div>`
        const m = res.data?.market || {}
        const mb = document.getElementById('marketBody'); if(mb) mb.innerHTML = `<div>Preset: ${m.preset_id||'—'}</div><div>Suggestions: breadth/correlations</div>`
      }catch(e:any){ const eb=document.getElementById('errorBanner'); if(eb){ eb.textContent = e?.detail?.hint || e?.detail?.error || 'error'; (eb as HTMLElement).style.display='block' } }
    })();
    // Activity
    (async()=>{
      try{
        const res = await api.get<any>('/dashboard/activity?limit=10')
        const list: any[] = res.data?.activities || []
        const el = document.getElementById('activityBody') as HTMLElement
        if(el){ el.innerHTML = list.length ? `<ul style='margin:0;padding-left:16px'>${list.map(a=>`<li>${a.title||a.type} — <span style='color:#8FA5A5'>${a.timestamp||''}</span></li>`).join('')}</ul>` : (el.dataset.emptyText || 'No activity') }
      }catch(e:any){ const eb=document.getElementById('errorBanner'); if(eb){ eb.textContent = e?.detail?.hint || e?.detail?.error || 'error'; (eb as HTMLElement).style.display='block' } }
    })();
    // Market breadth -> sentiment + volume heat intensity
    ;(async()=>{
      try{
        const b = await api.get<any>('/market/breadth?preset_id=sp500&cap=50')
        const adv = b.advance || 0, dec = b.decline || 0
        const highs = b.highs_52w || 0, lows = b.lows_52w || 0
        const advDec = document.getElementById('advDec'); if(advDec) advDec.textContent = `${adv} / ${dec}`
        const hiLo = document.getElementById('hiLo52'); if(hiLo) hiLo.textContent = `${highs} / ${lows}`
        const label = document.querySelector('.sentiment-card .gauge-label');
        if(label){ (label as HTMLElement).textContent = adv>dec ? 'Bullish' : (adv<dec ? 'Bearish' : 'Neutral') }
        // Set needle angle from adv/dec ratio: 0 -> -90deg, 1 -> +90deg
        const needle = document.querySelector('.sentiment-card .gauge-needle') as HTMLElement | null
        if(needle){
          const ratio = (adv+dec)>0 ? adv/(adv+dec) : 0.5
          const angle = (ratio - 0.5) * 180 // maps 0..1 to -90..+90
          needle.style.transform = `rotate(${angle.toFixed(1)}deg) translateY(-5px)`
          needle.setAttribute('title', `Adv/Dec: ${adv}/${dec} (${Math.round(ratio*100)}%)`)
        }
        const grid = document.getElementById('volumeHeatGrid') as HTMLElement | null
        if(grid){
          const ratio = (adv+dec)>0 ? adv/(adv+dec) : 0.5
          const cells: string[] = []
          const n = 36
          for(let i=0;i<n;i++){
            const jitter = (Math.random()-0.5)*0.2
            const intensity = Math.max(0, Math.min(1, ratio + jitter))
            const a = (0.15 + intensity * 0.55).toFixed(2)
            cells.push(`<div class=\"vh-cell\" style=\"background: rgba(26,188,156, ${a})\"></div>`)
          }
          grid.innerHTML = cells.join('')
        }
      }catch{}
    })();
    // Sector rotation by preset (best-effort)
    ;(async()=>{
      try{
        const presets = 'technology,healthcare,energy,financials,industrials,utilities,communication,realestate'
        const res = await api.get<any>(`/market/breadth/by_preset?presets=${encodeURIComponent(presets)}&cap=30`)
        const container = document.getElementById('sectorGrid') as HTMLElement | null
        if(container && Array.isArray(res.items)){
          const cells = container.querySelectorAll('.sector-cell .cell-value')
          res.items.slice(0, cells.length).forEach((it:any, idx:number)=>{
            const el = cells[idx] as HTMLElement
            const adv = it.advance||0, dec = it.decline||0
            const score = (adv+dec)>0 ? Math.round((adv/(adv+dec))*100) : 50
            el.textContent = `${score}%`
          })
        }
      }catch{}
    })();
    // Top movers: preset symbols -> market summary
    ;(async()=>{
      try{
        const symsRes = await api.get<any>('/presets/sp500/symbols')
        const syms: string[] = (symsRes.symbols || symsRes || []).slice(0,50)
        if(!syms.length) return
        const summary = await api.get<any>(`/market/summary?symbols=${encodeURIComponent(syms.join(','))}&cap=50`)
        const rows: any[] = Array.isArray(summary) ? summary : (summary.data||[])
        const sorted = rows
          .filter((r:any)=> typeof r.day_change_pct === 'number')
          .sort((a:any,b:any)=> (b.day_change_pct||0) - (a.day_change_pct||0))
        const top = sorted.slice(0,6)
        const el = document.getElementById('topMoversList') as HTMLElement | null
        if(el){
          el.innerHTML = top.map((m:any)=>{
            const pct = (m.day_change_pct*100).toFixed(1)
            const cls = m.day_change_pct>=0 ? 'up' : 'down'
            return `<li><span class=\"sym\">${m.symbol}</span><span class=\"chg ${cls}\">${m.day_change_pct>=0?'+':''}${pct}%</span></li>`
          }).join('')
        }
      }catch{}
    })();
  },[])

  useEffect(()=>{
    const url = wsUrl('/assistant/ws/dashboard')
    let ws: WebSocket|undefined
    try{
      ws = new WebSocket(url)
      const dot = document.getElementById('liveDot')
      ws.onopen = ()=>{ dot?.classList.add('online') }
      ws.onclose = ()=>{ dot?.classList.remove('online') }
      ws.onmessage = (ev)=>{
        try{
          const msg = JSON.parse(ev.data)
          if(msg?.portfolio){ const pb=document.getElementById('portfolioBody'); if(pb) pb.innerHTML = `<div>Total Equity: ${msg.portfolio.total_value ?? '—'}</div><div>Open Positions: ${msg.portfolio.open_positions ?? 0}</div>` }
          if(msg?.activity){ const el=document.getElementById('activityBody') as HTMLElement; if(el && Array.isArray(msg.activity) && msg.activity.length){ el.innerHTML = `<ul style='margin:0;padding-left:16px'>${msg.activity.map((a:any)=>`<li>${a.title||a.type} — <span style='color:#8FA5A5'>${a.timestamp||''}</span></li>`).join('')}</ul>` } }
        }catch{}
      }
    }catch{}
    return ()=>{ try{ ws?.close() }catch{} }
  },[])

  return (
    <AlexLayout>
      <ErrorBanner />
      <div className="content">
        <div className="three-column-layout">
          <div className="left-column">
            <div className="card"><div className="card-header"><div className="card-title">Activity</div></div><div className="card-content" id="activityBody" data-empty-text="No activity yet.">Loading...</div></div>
            <TopMoversCard />
          </div>
          <div className="center-column">
            <div className="card"><div className="card-header"><div className="card-title">Portfolio</div></div><div className="card-content" id="portfolioBody">Loading...</div></div>
            <MarketSentimentCard />
            <div className="card"><div className="card-header"><div className="card-title">Market</div></div><div className="card-content" id="marketBody">Loading...</div></div>
          </div>
          <div className="right-column">
            <SectorRotationCard />
            <VolumeHeatZonesCard />
            <div className="card status-card"><div className="card-header"><div className="card-title">Status</div></div><div className="card-content">Ready</div></div>
          </div>
        </div>
      </div>
    </AlexLayout>
  )
}
