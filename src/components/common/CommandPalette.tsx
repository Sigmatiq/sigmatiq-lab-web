import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../api/client'

type PaletteItem = {
  kind: string
  id: string
  label: string
  summary?: string
  action?: any
  text?: string
}

type Props = {
  open: boolean
  onClose: ()=>void
}

export default function CommandPalette({ open, onClose }: Props){
  const [q, setQ] = useState('')
  const [items, setItems] = useState<PaletteItem[]>([])
  const [selected, setSelected] = useState<PaletteItem|undefined>(undefined)
  const [text, setText] = useState('')
  const [action, setAction] = useState<any|undefined>(undefined)
  const [issues, setIssues] = useState<{warnings:string[];errors:string[]}>({warnings:[],errors:[]})
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<any|undefined>(undefined)
  const nextActions = preview?.next_actions as any[] | undefined

  useEffect(()=>{
    if(!open){
      setQ(''); setItems([]); setSelected(undefined); setText(''); setAction(undefined); setIssues({warnings:[],errors:[]}); setPreview(undefined)
    }
  }, [open])

  // Debounced search
  useEffect(()=>{
    if(!open) return
    const t = setTimeout(()=>{
      if(!q) { setItems([]); return }
      api.paletteSearch<{items:PaletteItem[]}>(q, 12).then(res=>{
        setItems(res.items||[])
      }).catch(()=>setItems([]))
    }, 180)
    return ()=>clearTimeout(t)
  }, [q, open])

  // When selecting an item, seed action/text
  function selectItem(it: PaletteItem){
    setSelected(it)
    setText(it.text || '')
    setAction(it.action)
    setIssues({warnings:[],errors:[]})
    setPreview(undefined)
  }

  // Debounced parse on text change -> updates action
  useEffect(()=>{
    if(!open) return
    const t = setTimeout(()=>{
      if(!text) { setAction(undefined); setIssues({warnings:[],errors:[]}); return }
      api.actionsParseText<{ok:boolean; action:any; normalized_text?:string; issues:{warnings:string[];errors:string[]}}>(text)
        .then(res=>{
          if(res.ok){
            setAction(res.action)
            setIssues(res.issues||{warnings:[],errors:[]})
            if(res.normalized_text) setText(res.normalized_text)
          } else {
            setIssues(res.issues||{warnings:[],errors:[]})
          }
        })
        .catch(()=>setIssues({warnings:[],errors:['parse_failed']}))
    }, 220)
    return ()=>clearTimeout(t)
  }, [text, open])

  async function onPreview(){
    if(!action) return
    setBusy(true)
    try{
      const val = await api.actionsValidate<{ok:boolean; action:any; issues:any}>(action)
      if(!val.ok){ setIssues(val.issues||{warnings:[],errors:['invalid_action']}); setBusy(false); return }
      const ex = await api.actionsExecute<{ok:boolean; summary?:string; data?:any; next_actions?:any; issues?:any}>(val.action, 'preview')
      setPreview(ex)
      setIssues(ex.issues||{warnings:[],errors:[]})
    }catch(err:any){
      const msg = err?.detail?.detail || err?.detail || err?.message || 'preview_failed'
      setIssues({warnings:[],errors:[String(msg)]})
      setPreview(undefined)
    } finally{
      setBusy(false)
    }
  }

  function onRun(){ if(!action) return; api.actionsExecute(action, 'run').catch(()=>{}) }

  if(!open) return null
  const overlay = (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:10000}} onClick={onClose}>
      <div style={{maxWidth:900, margin:'8vh auto', background:'#101317', border:'1px solid #243040', borderRadius:12, boxShadow:'0 10px 40px rgba(0,0,0,0.6)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'10px 14px', borderBottom:'1px solid #1e2733', display:'flex', gap:8}}>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search indicators, sets, strategies..." style={{flex:1, padding:'10px 12px', background:'#0c0f13', border:'1px solid #223040', borderRadius:8, color:'#e8eef5'}} />
        </div>
        <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:0, minHeight:320}}>
          <div style={{borderRight:'1px solid #1e2733', maxHeight:360, overflowY:'auto'}}>
            {(items||[]).map((it,idx)=> (
              <div key={it.id+idx} onClick={()=>selectItem(it)} style={{padding:'10px 12px', cursor:'pointer', borderBottom:'1px solid #141a22', background: selected?.id===it.id ? '#121a22' : undefined}}>
                <div style={{fontWeight:600, color:'#e8eef5'}}>{it.label}</div>
                {it.summary && <div style={{fontSize:12, color:'#9fb0c4'}}>{it.summary}</div>}
              </div>
            ))}
            {(!items || items.length===0) && <div style={{padding:12, color:'#7f90a5'}}>Type to search…</div>}
          </div>
          <div style={{padding:12}}>
            <div>
              <input value={text} onChange={e=>setText(e.target.value)} placeholder="Command (editable) e.g. Run indicator macd on sp500 (day), cap 25" style={{width:'100%', padding:'12px 14px', background:'#0c0f13', border:'1px solid #223040', borderRadius:8, color:'#e8eef5'}} />
            </div>
            {issues.errors.length>0 && (
              <div style={{marginTop:8, color:'#ff6b6b', fontSize:12}}>Errors: {issues.errors.join(', ')}</div>
            )}
            {issues.warnings.length>0 && (
              <div style={{marginTop:8, color:'#e5c07b', fontSize:12}}>Warnings: {issues.warnings.join(', ')}</div>
            )}
            <div style={{marginTop:10, display:'flex', gap:8}}>
              <button onClick={onPreview} disabled={!action || busy} style={{padding:'8px 12px', background:'#1f6feb', color:'#fff', border:'none', borderRadius:6}}>{busy? 'Previewing…':'Preview'}</button>
              <button onClick={onRun} disabled={!action || busy} style={{padding:'8px 12px', background:'#2ea043', color:'#fff', border:'none', borderRadius:6}}>Run</button>
              <button onClick={onClose} style={{padding:'8px 12px', background:'transparent', color:'#9fb0c4', border:'1px solid #223040', borderRadius:6}}>Close</button>
            </div>
            {preview && (
              <div style={{marginTop:12, padding:12, border:'1px solid #223040', borderRadius:8}}>
                <div style={{fontWeight:600, color:'#e8eef5', marginBottom:6}}>Preview</div>
                <div style={{color:'#9fb0c4', marginBottom:6}}>{preview.summary || '—'}</div>
                {preview.data && preview.data.sample && Array.isArray(preview.data.sample) && (
                  <div style={{fontSize:12, color:'#9fb0c4'}}>Sample: {preview.data.sample.join(', ')}</div>
                )}
                {Array.isArray(nextActions) && nextActions.length>0 && (
                  <div style={{marginTop:10}}>
                    <div style={{fontWeight:600, color:'#e8eef5', marginBottom:6}}>Next actions</div>
                    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                      {nextActions.map((na, idx)=> (
                        <button key={idx} onClick={()=>{ if(na.text) setText(na.text); if(na.action) setAction(na.action) }} style={{padding:'6px 10px', background:'#0f1720', color:'#e8eef5', border:'1px solid #223040', borderRadius:6}}>
                          {na.label || 'Next'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
  const root = typeof document !== 'undefined' ? document.body : null
  return root ? createPortal(overlay, root) : overlay
}
