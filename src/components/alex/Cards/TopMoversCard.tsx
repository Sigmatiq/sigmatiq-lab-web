import React from 'react'

export default function TopMoversCard(){
  return (
    <div className="card top-movers-card">
      <div className="card-header">
        <div className="card-title">Top Movers</div>
        <div className="card-badge">today</div>
      </div>
      <div className="card-content">
        <ul className="movers-list" id="topMoversList">
          {/* dynamically injected: <li><span class='sym'>AAPL</span><span class='chg up'>+3.2%</span></li> */}
        </ul>
      </div>
    </div>
  )
}

