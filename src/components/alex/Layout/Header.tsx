import React, { useEffect } from 'react'

type Props = {
  onOpenPalette?: () => void
}

export default function Header({ onOpenPalette }: Props){
  return (
    <header className="alex-header header">
      <div className="header-left">
        <div className="time-display">
          <div id="timeDisplay" className="current-time">--:--</div>
          <div id="marketStatus" className="market-status-text">Loading...</div>
        </div>
        <div className="market-indicators-container">
          <div className="stat-item">
            <div className="stat-label">SPY</div>
            <div className="stat-price" id="spyQuote">—</div>
            <div className="stat-change price-up" id="spyChg">—</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">VIX</div>
            <div className="stat-price" id="vixQuote">—</div>
            <div className="stat-change price-down" id="vixChg">—</div>
          </div>
          <div className="mini-time-toggle" id="timeframeToggles">
            <button className="mini-time-btn active">D</button>
            <button className="mini-time-btn">W</button>
            <button className="mini-time-btn">M</button>
            <button className="mini-time-btn">Y</button>
          </div>
        </div>
      </div>
      <div className="header-center">
        <select id="viewMode"><option>Heat Map</option><option>List View</option><option>Grid View</option></select>
        <select id="timeRange"><option>Today</option><option>This Week</option><option>This Month</option></select>
        <select id="signalFilter"><option>Active Only</option><option>All Signals</option><option>Flagged</option></select>
      </div>
      <div className="header-right">
        <button className="icon-btn" title="Command (Ctrl/Cmd+K)" onClick={onOpenPalette}>
          <img src="/src/assets/icons/command.svg" alt="cmd" width={18} height={18} />
        </button>
        <button className="icon-btn" title="Theme">
          <img src="/src/assets/icons/sun.svg" alt="theme" width={18} height={18} />
        </button>
        <button className="icon-btn" title="Notifications">
          <img src="/src/assets/icons/bell.svg" alt="bell" width={18} height={18} />
          <span className="notification-badge">18</span>
        </button>
        <div className="icon-btn" title="User" style={{borderRadius: '50%', background:'linear-gradient(135deg, #1ABC9C, #16A085)'}}></div>
        <span style={{marginLeft:8}}>Live</span><span id="liveDot" className="live-dot"></span>
      </div>
    </header>
  )
}
