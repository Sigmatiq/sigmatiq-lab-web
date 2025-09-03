import React from 'react'

export default function MarketSentimentCard(){
  return (
    <div className="card sentiment-card">
      <div className="card-header">
        <div className="card-title">Market Sentiment</div>
        <div className="card-badge">today</div>
      </div>
      <div className="card-content">
        <div className="sentiment-gauge" id="sentimentGauge">
          <div className="gauge-arc"></div>
          <div className="gauge-needle"></div>
          <div className="gauge-label">Neutral</div>
        </div>
        <div className="sentiment-meta">
          <div className="meta-item"><span className="meta-label">Adv/Dec</span><span className="meta-value" id="advDec">— / —</span></div>
          <div className="meta-item"><span className="meta-label">52w High/Low</span><span className="meta-value" id="hiLo52">— / —</span></div>
        </div>
      </div>
    </div>
  )
}

