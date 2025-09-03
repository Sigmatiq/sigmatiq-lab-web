import React from 'react'

export default function VolumeHeatZonesCard(){
  return (
    <div className="card volume-heat-card">
      <div className="card-header">
        <div className="card-title">Volume Heat Zones</div>
        <div className="card-badge">intraday</div>
      </div>
      <div className="card-content">
        <div className="volume-heat-grid" id="volumeHeatGrid">
          {/* dynamically injected cells */}
        </div>
      </div>
    </div>
  )
}

