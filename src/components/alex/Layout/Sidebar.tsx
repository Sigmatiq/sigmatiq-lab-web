import React from 'react'

export default function Sidebar(){
  return (
    <aside className="alex-sidebar" id="navItems">
      <div className="sidebar-logo">
        <div className="logo-icon">
          {[...Array(9)].map((_,i)=>{
            const cls = 'pixel'
            const style: React.CSSProperties = { background: i%2===0? 'var(--sigmatiq-teal)' : 'var(--sigmatiq-teal-light)' }
            return <div key={i} className={cls} style={style}></div>
          })}
        </div>
        <div className="logo-text">SIGMATIQ</div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>
          <div className="nav-item active">
            <div className="nav-item-icon"><img src="/src/assets/icons/home.svg" alt="home" width={20} height={20} /></div>
            <div className="nav-item-text">Dashboard</div>
            <div className="nav-item-badge">3</div>
          </div>
          <div className="nav-item">
            <div className="nav-item-icon"><img src="/src/assets/icons/sun.svg" alt="morning" width={20} height={20} /></div>
            <div className="nav-item-text">Morning</div>
          </div>
        </div>
        <div className="nav-divider" />
        <div className="nav-section">
          <div className="nav-section-title">Work</div>
          <div className="nav-item">
            <div className="nav-item-icon"><img src="/src/assets/icons/bell.svg" alt="alerts" width={20} height={20} /></div>
            <div className="nav-item-text">Alerts</div>
          </div>
          <div className="nav-item">
            <div className="nav-item-icon"><img src="/src/assets/icons/command.svg" alt="backtests" width={20} height={20} /></div>
            <div className="nav-item-text">Backtests</div>
          </div>
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="lab-icon">
          {[...Array(9)].map((_,i)=> <div key={i} className="lab-pixel" style={{background:i%2===0? 'var(--sigmatiq-golden)':'var(--sigmatiq-border)'}}></div>)}
        </div>
        <div className="lab-text">SIGMA LAB</div>
      </div>
    </aside>
  )
}
