import React from 'react'

const SECTORS = ['Tech','Health','Energy','Financials','Industrials','Utilities','Comm','Real Estate']

export default function SectorRotationCard(){
  return (
    <div className="card sector-rotation-card">
      <div className="card-header">
        <div className="card-title">Sector Rotation</div>
        <div className="card-badge">heat map</div>
      </div>
      <div className="card-content">
        <div className="sector-grid" id="sectorGrid">
          {SECTORS.map((s)=> (
            <div key={s} className="sector-cell" data-sector={s} title={s}>
              <div className="cell-name">{s}</div>
              <div className="cell-value">—</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

