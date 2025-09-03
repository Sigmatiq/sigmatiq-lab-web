import { api, wsUrl } from '@api/client'

function text(id:string, val:string){ const el=document.getElementById(id); if(el) el.textContent=val }
function html(id:string, val:string){ const el=document.getElementById(id); if(el) el.innerHTML=val }
function showError(msg:string, hint?:string){ const el=document.getElementById('errorBanner'); if(!el) return; el.textContent = `${msg}${hint? ' — '+hint: ''}`; (el as HTMLElement).style.display='block' }

async function loadSummary(){
  try{
    const res = await api.get<any>('/dashboard/summary')
    const p = res.data?.portfolio || {}
    html('portfolioBody', `<div>Total Equity: ${p.total_value ?? '—'}</div><div>Open Positions: ${p.open_positions ?? 0}</div>`)
    const m = res.data?.market || {}
    html('marketBody', `<div>Preset: ${m.preset_id||'—'}</div><div>Suggestions: breadth/correlations</div>`)
  }catch(e:any){ showError(e?.detail?.error||'error', e?.detail?.hint) }
}

async function loadActivity(){
  try{
    const res = await api.get<any>('/dashboard/activity?limit=10')
    const list: any[] = res.data?.activities || []
    const el = document.getElementById('activityBody') as HTMLElement
    if(!el) return
    if(!list.length){ el.textContent = el.dataset.emptyText || 'No activity'; return }
    el.innerHTML = `<ul style="margin:0;padding-left:16px">${list.map(a=>`<li>${a.title||a.type} — <span style='color:#8FA5A5'>${a.timestamp||''}</span></li>`).join('')}</ul>`
  }catch(e:any){ showError(e?.detail?.error||'error', e?.detail?.hint) }
}

function live(){
  const url = wsUrl('/assistant/ws/dashboard')
  try{
    const ws = new WebSocket(url)
    const dot = document.getElementById('liveDot')
    ws.onopen = ()=>{ dot?.classList.add('online') }
    ws.onclose = ()=>{ dot?.classList.remove('online'); setTimeout(live, 2000) }
    ws.onmessage = (ev)=>{
      try{
        const msg = JSON.parse(ev.data)
        if(msg?.portfolio){ html('portfolioBody', `<div>Total Equity: ${msg.portfolio.total_value ?? '—'}</div><div>Open Positions: ${msg.portfolio.open_positions ?? 0}</div>`) }
        if(msg?.activity){ const el = document.getElementById('activityBody') as HTMLElement; if(el && Array.isArray(msg.activity) && msg.activity.length){ el.innerHTML = `<ul style=\"margin:0;padding-left:16px\">${msg.activity.map((a:any)=>`<li>${a.title||a.type} — <span style='color:#8FA5A5'>${a.timestamp||''}</span></li>`).join('')}</ul>` } }
      }catch{}
    }
  }catch{}
}

function clock(){ const d=new Date(); text('timeDisplay', d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })) }

clock(); setInterval(clock, 1000)
loadSummary(); loadActivity(); live()

