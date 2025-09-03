import React from 'react'

export default function BottomNav(){
  return (
    <footer className="alex-bottom">
      <div className="bottom-nav">
        <div className="bottom-grid">
          {[
            {label:'Screener'},
            {label:'Saved Scans'},
            {label:'Recipes'},
            {label:'Workflows'},
            {label:'Backtests'},
            {label:'Models'},
            {label:'Packs'},
            {label:'Alerts'},
            {label:'Watchlists'},
            {label:'Presets'},
            {label:'Market'},
            {label:'Help'},
          ].map((it,i)=> (
            <div key={i} className="bottom-item"><span>•</span><span>{it.label}</span></div>
          ))}
        </div>
      </div>
    </footer>
  )
}
